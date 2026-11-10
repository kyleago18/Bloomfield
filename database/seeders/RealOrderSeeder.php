<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Seller;
use App\Models\Delivery;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

class RealOrderSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure Customers exist
        $customers = User::where('role', 'customer')->get();
        if ($customers->isEmpty()) {
            $customers = collect([
                User::create([
                    'name' => 'Kyle Ago',
                    'first_name' => 'Kyle',
                    'last_name' => 'Ago',
                    'email' => 'kyleago182002@gmail.com',
                    'password' => Hash::make('password123'),
                    'role' => 'customer',
                ])
            ]);
        }

        // 2. Fetch ALL products grouped by seller
        $productsBySeller = Product::all()->groupBy('seller_id');

        if ($productsBySeller->isEmpty()) {
            $this->command->warn('No products found in the database. Please run the product seeder first.');
            return;
        }

        $orderCount = 0;
        $statuses = ['Pending', 'Processing', 'Shipped', 'Completed'];
        $deliveryMethods = ['Delivery', 'Pickup'];
        $paymentMethods = ['Credit Card', 'Cash on Delivery', 'Bank Transfer', 'Stripe'];

        foreach ($productsBySeller as $sellerId => $sellerProducts) {
            // Ensure seller exists
            $seller = Seller::find($sellerId);
            if (!$seller) {
                continue;
            }

            // --- Phase 1: High density orders for the LAST 30 DAYS ---
            // This ensures the "Monthly" dashboard chart has rich, active data points every day/week.
            $numRecentOrders = rand(30, 60);
            for ($i = 0; $i < $numRecentOrders; $i++) {
                $orderDate = Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));
                $customer = $customers->random();
                $this->createOrder($orderDate, $sellerId, $customer, $sellerProducts, $statuses, $deliveryMethods, $paymentMethods);
                $orderCount++;
            }

            // --- Phase 2: Historical orders for the LAST 1-2 YEARS ---
            // This ensures all-time metrics, lifetime revenue, and yearly trends are robust.
            $numHistoricalOrders = rand(40, 80);
            for ($i = 0; $i < $numHistoricalOrders; $i++) {
                // Random date between 31 days ago and 2 years ago
                $daysAgo = rand(31, 730);
                $orderDate = Carbon::now()->subDays($daysAgo)->subHours(rand(0, 23));
                $customer = $customers->random();
                $this->createOrder($orderDate, $sellerId, $customer, $sellerProducts, $statuses, $deliveryMethods, $paymentMethods);
                $orderCount++;
            }
        }

        $this->command->info("Successfully created $orderCount realistic orders (dense recent data + historical data)!");
    }

    private function createOrder($orderDate, $sellerId, $customer, $sellerProducts, $statuses, $deliveryMethods, $paymentMethods)
    {
        $deliveryMethod = $deliveryMethods[array_rand($deliveryMethods)];
        
        // Older orders are almost always completed. Recent ones have varied statuses.
        if ($orderDate->diffInDays(Carbon::now()) > 10) {
            $status = rand(1, 10) > 1 ? 'Completed' : 'Cancelled';
        } else {
            $status = $statuses[array_rand($statuses)];
        }

        $firstName = $customer->first_name ?: (explode(' ', trim($customer->name))[0] ?? 'Customer');
        $lastName = $customer->last_name ?: (trim(substr($customer->name, strlen($firstName))) ?: 'User');
        
        $order = Order::create([
            'user_id' => $customer->user_id ?? $customer->id,
            'seller_id' => $sellerId,
            'order_date' => $orderDate,
            'order_status' => $status,
            'customer_first_name' => $firstName,
            'customer_last_name' => $lastName,
            'customer_contact' => $customer->mobile_number ?? '09123456789',
            'customer_email' => $customer->email,
            'receiver_first_name' => $firstName,
            'receiver_last_name' => $lastName,
            'receiver_contact' => $customer->mobile_number ?? '09123456789',
            'receiver_email' => $customer->email,
            'delivery_method' => $deliveryMethod,
            'payment_method' => $paymentMethods[array_rand($paymentMethods)],
            'payment_status' => in_array($status, ['Shipped', 'Completed']) ? 'Paid' : (rand(0,1) ? 'Paid' : 'Pending'),
            'total_amount' => 0, 
            'created_at' => $orderDate,
            'updated_at' => clone $orderDate->addHours(rand(1, 48)),
        ]);

        $totalAmount = 0;
        
        // Add 1-4 items
        $itemsToTake = rand(1, min(4, $sellerProducts->count()));
        $selectedProducts = $sellerProducts->random($itemsToTake);

        foreach ($selectedProducts as $product) {
            $qty = rand(1, 3);
            $subtotal = $product->effective_price * $qty;
            $totalAmount += $subtotal;

            OrderItem::create([
                'order_id' => $order->order_id ?? $order->id,
                'product_id' => $product->product_id ?? $product->id,
                'quantity' => $qty,
                'subtotal' => $subtotal,
                'created_at' => $orderDate,
                'updated_at' => $orderDate,
            ]);
        }

        $deliveryFee = $deliveryMethod === 'Delivery' ? rand(5, 15) : 0;
        $totalAmount += $deliveryFee;

        $order->update(['total_amount' => $totalAmount]);

        if ($deliveryMethod === 'Delivery') {
            Delivery::create([
                'order_id' => $order->order_id ?? $order->id,
                'street_address' => '123 Floral Ave',
                'city' => 'Blossom City',
                'province' => 'BC',
                'delivery_fee' => $deliveryFee,
                'delivery_status' => $status === 'Completed' ? 'Delivered' : ($status === 'Shipped' ? 'Out for Delivery' : 'Pending'),
                'created_at' => $orderDate,
                'updated_at' => clone $orderDate->addDays(rand(1,3)),
            ]);
        }
    }
}
