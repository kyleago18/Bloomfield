<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class ProcessOrderNotifications implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $userId,
        public int $sellerId,
        public int $orderId,
        public string $displayOrderId,
        public float $totalAmount,
        public array $cartItems,
        public array $customer,
        public string $paymentMethodLabel
    ) {}

    public function handle(): void
    {
        $seller = DB::table('sellers')->where('id', $this->sellerId)->first();
        if (!$seller) return;

        // Customer Notification (idempotent check)
        $customerNotifExists = DB::table('notifications')
            ->where('user_id', $this->userId)
            ->where('type', 'order_placed')
            ->where('order_id', $this->orderId)
            ->exists();

        if (!$customerNotifExists) {
            DB::table('notifications')->insert([
                'user_id' => $this->userId,
                'type' => 'order_placed',
                'title' => 'Order successfully placed',
                'body' => 'Your order ' . $this->displayOrderId . ' at ' . $seller->shop_name . ' has been successfully placed.',
                'data' => json_encode([
                    'order_id' => $this->orderId,
                    'display_order_id' => $this->displayOrderId,
                    'shop_name' => $seller->shop_name,
                    'total_amount' => $this->totalAmount,
                ]),
                'order_id' => $this->orderId,
                'seller_id' => $this->sellerId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Seller Notification (idempotent check)
        if ($seller->user_id) {
            $sellerNotifExists = DB::table('notifications')
                ->where('user_id', $seller->user_id)
                ->where('type', 'new_order')
                ->where('order_id', $this->orderId)
                ->exists();

            if (!$sellerNotifExists) {
                $productIds = array_column($this->cartItems, 'product_id');
                $productNames = DB::table('products')
                    ->whereIn('product_id', $productIds)
                    ->pluck('flower_name', 'product_id');

                $productsData = [];
                foreach ($this->cartItems as $item) {
                    $productsData[] = [
                        'name' => $productNames[$item['product_id']] ?? 'Product',
                        'quantity' => $item['quantity'],
                    ];
                }

                DB::table('notifications')->insert([
                    'user_id' => $seller->user_id,
                    'type' => 'new_order',
                    'title' => 'New Order Received',
                    'body' => 'Customer ' . $this->customer['firstName'] . ' ' . $this->customer['lastName'] . ' placed order ' . $this->displayOrderId . ' for ₱' . number_format($this->totalAmount, 2),
                    'data' => json_encode([
                        'order_id' => $this->orderId,
                        'display_order_id' => $this->displayOrderId,
                        'customer_name' => $this->customer['firstName'] . ' ' . $this->customer['lastName'],
                        'products' => $productsData,
                        'total_amount' => $this->totalAmount,
                        'payment_method' => $this->paymentMethodLabel,
                    ]),
                    'order_id' => $this->orderId,
                    'seller_id' => $this->sellerId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
