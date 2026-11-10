<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckoutRequest;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService
    ) {}

    public function store(CheckoutRequest $request): JsonResponse
    {
        if (auth()->check() && auth()->user()->role === 'admin') {
            return response()->json([
                'error' => 'Super Admins are restricted from placing orders.'
            ], 403);
        }

        $validated = $request->validated();

        $labels = [
            'cod'         => 'Cash on Delivery',
            'credit_card' => 'Credit Card',
            'debit_card'  => 'Debit Card',
            'gcash'       => 'GCash / E-Wallet',
        ];
        $paymentLabel = $labels[$validated['paymentMethod']] ?? 'Cash on Delivery';
        $paymentStatus = in_array($validated['paymentMethod'], ['credit_card', 'debit_card', 'gcash']) ? 'Paid' : 'Pending Payment';

        DB::beginTransaction();

        try {
            $orderId = $this->orderService->createOrder(
                $validated,
                $paymentLabel,
                $paymentStatus
            );

            DB::commit();

            return response()->json([
                'message' => 'Order placed successfully!',
                'url' => url('/checkout/success?order_id='.$orderId),
                'orderId' => $orderId,
            ]);
        } catch (InvalidArgumentException $e) {
            DB::rollBack();

            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order Checkout Error: '.$e->getMessage());

            return response()->json([
                'error' => 'An error occurred while processing your order.',
            ], 500);
        }
    }
}
