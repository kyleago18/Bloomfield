<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckoutRequest;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Exception\ApiErrorException;
use Stripe\Stripe;
use Stripe\Webhook;

class PaymentController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService
    ) {}

    /**
     * Create a Stripe Hosted Checkout Session and return the redirect URL.
     */
    public function createCheckoutSession(CheckoutRequest $request): JsonResponse
    {
        if (!auth()->check()) {
            return response()->json([
                'error' => 'Unauthenticated. Please log in again before continuing to payment.',
            ], 401);
        }

        if (auth()->user()->role === 'admin') {
            return response()->json([
                'error' => 'Super Admins are restricted from placing orders.',
            ], 403);
        }

        $validated = $request->validated();
        $isDelivery = $validated['deliveryMethod'] === 'delivery';

        Log::info('Stripe Checkout Session creation started', [
            'user_id' => auth()->id(),
            'payload' => $validated,
        ]);

        try {
            $this->orderService->validatePrices($validated['cartItems']);
            $this->orderService->validateStock($validated['cartItems']);
        } catch (InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        $stripeSecret = config('services.stripe.secret');
        if (empty($stripeSecret)) {
            Log::error('Stripe Checkout Session failed: no Stripe secret configured.');

            return response()->json(['error' => 'Stripe is not configured for this server. Please contact support.'], 500);
        }

        Stripe::setApiKey($stripeSecret);
        $stripeCurrency = config('services.stripe.currency', 'php');

        // Build Stripe line_items from cart
        $lineItems = [];
        foreach ($validated['cartItems'] as $item) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => $stripeCurrency,
                    'unit_amount' => (int) round((float) $item['price'] * 100),
                    'product_data' => [
                        'name' => $item['flower_name'] ?? $item['name'] ?? 'Bloom&Glow Product',
                    ],
                ],
                'quantity' => (int) $item['quantity'],
            ];
        }

        // Add delivery fee as a separate line item if delivery
        if ($isDelivery) {
            $shippingFee = (float) ($validated['shippingFee'] ?? 0);
            $lineItems[] = [
                'price_data' => [
                    'currency' => $stripeCurrency,
                    'unit_amount' => (int) round($shippingFee * 100),
                    'product_data' => [
                        'name' => 'Delivery Fee',
                    ],
                ],
                'quantity' => 1,
            ];
        }

        // Add priced add-ons as separate line items
        $addOns = $validated['specialRequests']['addOns'] ?? [];
        foreach ($addOns as $addOnId) {
            $price = 0;
            $name = '';
            if ($addOnId === 'chocolate_pack') {
                $price = 100;
                $name = 'Add-on: Chocolate Pack';
            } elseif ($addOnId === 'polaroid_photo') {
                $price = 150;
                $name = 'Add-on: Polaroid Photo';
            }

            if ($price > 0) {
                $lineItems[] = [
                    'price_data' => [
                        'currency' => $stripeCurrency,
                        'unit_amount' => (int) round($price * 100),
                        'product_data' => [
                            'name' => $name,
                        ],
                    ],
                    'quantity' => 1,
                ];
            }
        }

        try {
            $session = StripeSession::create([
                'payment_method_types' => ['card'],
                'mode' => 'payment',
                'line_items' => $lineItems,
                'success_url' => url('/checkout/success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => url('/checkout'),
                'customer_email' => $validated['customer']['email'] ?? null,
                'metadata' => [
                    'user_id' => (string) auth()->id(),
                    'customer_name' => trim(($validated['customer']['firstName'] ?? '') . ' ' . ($validated['customer']['lastName'] ?? '')),
                ],
            ]);

            Log::info('Stripe Checkout Session created successfully', [
                'user_id' => auth()->id(),
                'session_id' => $session->id,
                'url' => $session->url,
            ]);
        } catch (ApiErrorException $e) {
            Log::error('Stripe Checkout Session creation failed', [
                'user_id' => auth()->id(),
                'message' => $e->getMessage(),
                'request_id' => $e->getRequestId(),
                'http_status' => $e->getHttpStatus(),
                'stripe_code' => $e->getStripeCode(),
            ]);

            return response()->json([
                'error' => 'Unable to initialize payment.',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 502);
        } catch (\Throwable $e) {
            Log::error('Stripe Checkout Session creation failed with unexpected error', [
                'user_id' => auth()->id(),
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Payment initialization failed due to a server-side Stripe error. Please try again or contact support.',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 502);
        }

        // Cache checkout data keyed by session ID for webhook fulfillment
        Cache::put(
            'pending_checkout:' . $session->id,
            $validated,
            now()->addHours(24)
        );

        return response()->json([
            'checkout_url' => $session->url,
        ]);
    }

    /**
     * Stripe Webhook handler.
     */
    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        if (!$webhookSecret) {
            Log::warning('Stripe webhook secret is not configured.');

            return response()->json(['error' => 'Webhook not configured.'], 500);
        }

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (\UnexpectedValueException $e) {
            return response()->json(['error' => 'Invalid payload.'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature.'], 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            $this->fulfillCheckoutSession($session->id, $session);
        }

        return response()->json(['received' => true]);
    }

    /**
     * Fulfill a Checkout Session (called from webhook).
     */
    private function fulfillCheckoutSession(string $sessionId, object $session): void
    {
        if ($this->orderService->orderExistsForCheckoutSession($sessionId)) {
            return;
        }

        $validated = Cache::get('pending_checkout:' . $sessionId);
        if (!$validated) {
            Log::warning('No pending checkout found for Checkout Session: ' . $sessionId);

            return;
        }

        DB::beginTransaction();

        try {
            $paymentLabel = $this->resolveCheckoutSessionPaymentLabel($session);

            $this->orderService->createOrder(
                $validated,
                $paymentLabel,
                'Paid',
                [
                    'payment_intent_id' => $session->payment_intent ?? null,
                    'payment_status' => $session->payment_status ?? 'paid',
                    'amount_paid' => round(($session->amount_total ?? 0) / 100, 2),
                    'paid_at' => now(),
                    'checkout_session_id' => $sessionId,
                ]
            );

            DB::commit();
            Cache::forget('pending_checkout:' . $sessionId);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Webhook checkout session fulfillment failed: ' . $e->getMessage());
        }
    }

    /**
     * Resolve a human-readable payment method label from a Checkout Session.
     */
    private function resolveCheckoutSessionPaymentLabel(object $session): string
    {
        // Checkout Session stores payment method types as an array
        $types = $session->payment_method_types ?? [];
        $type = $types[0] ?? null;

        // If we have a payment intent, try to get more specific info
        if (isset($session->payment_intent) && is_string($session->payment_intent)) {
            try {
                $pi = \Stripe\PaymentIntent::retrieve($session->payment_intent);
                if (isset($pi->payment_method) && is_string($pi->payment_method)) {
                    $pm = \Stripe\PaymentMethod::retrieve($pi->payment_method);
                    $type = $pm->type ?? $type;

                    // Check for wallet (Apple/Google Pay) — these show as 'card' type with a wallet object
                    if ($type === 'card' && isset($pm->card->wallet->type)) {
                        $type = $pm->card->wallet->type;
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Could not retrieve payment method details: ' . $e->getMessage());
            }
        }

        return match ($type) {
            'card' => 'Credit/Debit Card',
            'apple_pay' => 'Apple Pay',
            'google_pay' => 'Google Pay',
            'link' => 'Link by Stripe',
            'klarna' => 'Klarna',
            'affirm' => 'Affirm',
            'amazon_pay' => 'Amazon Pay',
            'cashapp' => 'Cash App Pay',
            'samsung_pay' => 'Samsung Pay',
            default => $type ? ucwords(str_replace('_', ' ', $type)) : 'Online Payment (Stripe)',
        };
    }
}
