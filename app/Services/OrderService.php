<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class OrderService
{
    /**
     * Calculate the order total using server-side prices fetched from the database.
     * NEVER trusts client-supplied prices — they are ignored in the final calculation.
     */
    public function calculateTotal(array $cartItems, float $deliveryFee, array $specialRequests = []): float
    {
        $productIds = array_column($cartItems, 'product_id');
        $products   = DB::table('products')
            ->whereIn('product_id', $productIds)
            ->get()
            ->keyBy('product_id');

        $total = 0;
        foreach ($cartItems as $item) {
            $product = $products->get($item['product_id']);
            if (! $product) {
                throw new InvalidArgumentException('One or more products in your cart are no longer available.');
            }
            // Use effective price from DB: discount_price if set, otherwise regular price
            $serverPrice = !empty($product->discount_price)
                ? (float) $product->discount_price
                : (float) $product->price;

            $total += $serverPrice * (int) $item['quantity'];
        }

        $addOnsTotal = $this->calculateAddOnsTotal($specialRequests);
        $total += $deliveryFee + $addOnsTotal;

        return round($total, 2);
    }

    public function calculateAddOnsTotal(array $specialRequests): float
    {
        $addOns = $specialRequests['addOns'] ?? [];
        $total = 0.0;
        foreach ($addOns as $addOnId) {
            if ($addOnId === 'chocolate_pack') $total += 100.0;
            if ($addOnId === 'polaroid_photo') $total += 150.0;
        }
        return $total;
    }

    public function validateStock(array $cartItems, bool $lock = false): void
    {
        $productIds = array_column($cartItems, 'product_id');
        $query = DB::table('products')->whereIn('product_id', $productIds);

        if ($lock) {
            $query->lockForUpdate();
        }

        $products = $query->get()->keyBy('product_id');

        foreach ($cartItems as $item) {
            $product = $products->get($item['product_id']);

            if (!$product) {
                throw new InvalidArgumentException('One or more products in your cart are no longer available.');
            }

            if (!$product->is_active) {
                throw new InvalidArgumentException("{$product->flower_name} is no longer available.");
            }

            if ((int) $product->stock < (int) $item['quantity']) {
                throw new InvalidArgumentException(
                    "Insufficient stock for {$product->flower_name}. Only {$product->stock} left."
                );
            }
        }
    }

    public function validatePrices(array $cartItems): void
    {
        $productIds = array_column($cartItems, 'product_id');
        $products = DB::table('products')->whereIn('product_id', $productIds)->get()->keyBy('product_id');

        foreach ($cartItems as $item) {
            $product = $products->get($item['product_id']);

            if (!$product) {
                throw new InvalidArgumentException('One or more products in your cart are no longer available.');
            }

            $currentPrice = !empty($product->discount_price) ? (float) $product->discount_price : (float) $product->price;

            if (round($currentPrice, 2) !== round((float) $item['price'], 2)) {
                throw new InvalidArgumentException(
                    "The price for {$product->flower_name} has changed. Please refresh your cart."
                );
            }
        }
    }

    public function createOrder(array $validated, string $paymentMethodLabel, string $paymentStatus, ?array $stripeData = null): int
    {
        $isDelivery = ($validated['deliveryMethod'] ?? 'delivery') === 'delivery';
        $deliveryFee = $isDelivery ? (float) ($validated['shippingFee'] ?? 0) : 0.00;
        $totalAmount = $this->calculateTotal($validated['cartItems'], $deliveryFee, $validated['specialRequests'] ?? []);

        $this->validatePrices($validated['cartItems']);
        $this->validateStock($validated['cartItems'], lock: true);

        $userId = Auth::id();
        if (!$userId) {
            throw new InvalidArgumentException('You must be logged in to place an order.');
        }

        $sellerId = null;
        $firstProductId = $validated['cartItems'][0]['product_id'] ?? null;
        if ($firstProductId) {
            $product = DB::table('products')->where('product_id', $firstProductId)->first();
            $sellerId = $product->seller_id ?? null;
        }

        $displayOrderId = Order::generateDisplayOrderId();

        $orderId = DB::table('orders')->insertGetId([
            'display_order_id' => $displayOrderId,
            'user_id' => $userId,
            'seller_id' => $sellerId,
            'total_amount' => $totalAmount,
            'order_status' => 'Pending',
            'customer_first_name' => $validated['customer']['firstName'],
            'customer_last_name' => $validated['customer']['lastName'],
            'customer_contact' => $validated['customer']['contact'],
            'customer_email' => $validated['customer']['email'],
            'receiver_first_name' => $validated['receiver']['firstName'],
            'receiver_last_name' => $validated['receiver']['lastName'],
            'receiver_contact' => $validated['receiver']['contact'],
            'receiver_email' => $validated['receiver']['email'],
            'delivery_method' => $validated['deliveryMethod'],
            'payment_method' => $paymentMethodLabel,
            'payment_status' => $paymentStatus,
            'stripe_payment_intent_id' => $stripeData['payment_intent_id'] ?? null,
            'stripe_payment_status' => $stripeData['payment_status'] ?? null,
            'stripe_checkout_session_id' => $stripeData['checkout_session_id'] ?? null,
            'amount_paid' => $stripeData['amount_paid'] ?? ($paymentStatus === 'Paid' ? $totalAmount : null),
            'paid_at' => $stripeData['paid_at'] ?? ($paymentStatus === 'Paid' ? now() : null),
            'scheduled_date' => $validated['schedule']['date'],
            'scheduled_time' => $validated['schedule']['time'],
            'special_requests' => isset($validated['specialRequests']) ? json_encode($validated['specialRequests']) : null,
            'created_at' => now(),
            'updated_at' => now(),
        ], 'order_id');

        // Build order items using SERVER-SIDE prices (never client-supplied values)
        $productIds    = array_column($validated['cartItems'], 'product_id');
        $dbProducts    = DB::table('products')->whereIn('product_id', $productIds)->get()->keyBy('product_id');

        $orderItems = [];
        foreach ($validated['cartItems'] as $item) {
            $dbProduct   = $dbProducts->get($item['product_id']);
            $serverPrice = $dbProduct && !empty($dbProduct->discount_price)
                ? (float) $dbProduct->discount_price
                : (float) ($dbProduct->price ?? 0);

            $orderItems[] = [
                'order_id'   => $orderId,
                'product_id' => $item['product_id'],
                'quantity'   => (int) $item['quantity'],
                'subtotal'   => $serverPrice * (int) $item['quantity'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('order_items')->insert($orderItems);

        DB::table('deliveries')->insert([
            'order_id' => $orderId,
            'dropoff_latitude' => $validated['deliveryLocation']['lat'] ?? null,
            'dropoff_longitude' => $validated['deliveryLocation']['lng'] ?? null,
            'delivery_fee' => $deliveryFee,
            'delivery_status' => 'Pending',
            'region' => $validated['address']['region'] ?? null,
            'province' => $validated['address']['province'] ?? null,
            'city' => $validated['address']['city'] ?? null,
            'barangay' => $validated['address']['barangay'] ?? null,
            'street_address' => $validated['address']['street'] ?? null,
            'landmark' => $validated['address']['landmark'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->reduceStock($validated['cartItems']);

        $paymentAmount = $stripeData['amount_paid'] ?? ($paymentStatus === 'Paid' ? $totalAmount : 0.00);
        $this->createPaymentRecord(
            $orderId,
            $paymentMethodLabel,
            $paymentStatus,
            $paymentAmount,
            $stripeData,
            [
                'delivery_method' => $validated['deliveryMethod'] ?? null,
                'payment_method' => $paymentMethodLabel,
            ]
        );

        // Generate Customer & Seller Notifications via Background Job
        if ($sellerId) {
            \App\Jobs\ProcessOrderNotifications::dispatch(
                $userId,
                $sellerId,
                $orderId,
                $displayOrderId,
                $totalAmount,
                $validated['cartItems'],
                $validated['customer'],
                $paymentMethodLabel
            );
        }

        return $orderId;
    }

    public function reduceStock(array $cartItems): void
    {
        foreach ($cartItems as $item) {
            DB::table('products')
                ->where('product_id', $item['product_id'])
                ->decrement('stock', (int) $item['quantity']);
        }
    }

    public function orderExistsForPaymentIntent(string $paymentIntentId): ?int
    {
        $payment = DB::table('payments')
            ->where('provider', 'stripe')
            ->where('provider_payment_id', $paymentIntentId)
            ->first();

        if ($payment) {
            return (int) $payment->order_id;
        }

        $order = DB::table('orders')
            ->where('stripe_payment_intent_id', $paymentIntentId)
            ->first();

        return $order ? (int) $order->order_id : null;
    }

    public function orderExistsForCheckoutSession(string $sessionId): ?int
    {
        // Check payments table for checkout session stored in metadata
        $payment = DB::table('payments')
            ->where('provider', 'stripe')
            ->where('metadata', 'like', '%' . $sessionId . '%')
            ->first();

        if ($payment) {
            return (int) $payment->order_id;
        }

        // Check orders table for the session ID stored in stripe_payment_intent_id (fallback)
        $order = DB::table('orders')
            ->where('stripe_checkout_session_id', $sessionId)
            ->first();

        return $order ? (int) $order->order_id : null;
    }

    private function createPaymentRecord(int $orderId, string $paymentMethodLabel, string $paymentStatus, float $amount, ?array $stripeData = null, array $metadata = []): int
    {
        $currency = $stripeData ? config('services.stripe.currency', 'php') : 'php';

        return DB::table('payments')->insertGetId([
            'order_id' => $orderId,
            'provider' => $stripeData ? 'stripe' : 'manual',
            'method' => $paymentMethodLabel,
            'status' => $paymentStatus,
            'provider_payment_id' => $stripeData['payment_intent_id'] ?? null,
            'provider_payment_status' => $stripeData['payment_status'] ?? null,
            'amount' => $amount,
            'currency' => $currency,
            'metadata' => json_encode($metadata),
            'paid_at' => $stripeData['paid_at'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ], 'payment_id');
    }
}
