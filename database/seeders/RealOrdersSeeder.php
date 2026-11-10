<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Seller;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Delivery;
use App\Models\Payment;
use Carbon\Carbon;

class RealOrdersSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Cleanup Dummy Data
        $dummyEmails = ['sample.customer@gmail.com', 'customer@gmail.com', 'jane@example.com', 'sample.customer@example.com', 'customer@example.com'];
        $dummyUsers = User::whereIn('email', $dummyEmails)->get();
        
        foreach ($dummyUsers as $dummy) {
            $orders = Order::where('user_id', $dummy->id)->get();
            foreach ($orders as $order) {
                OrderItem::where('order_id', $order->order_id)->delete();
                Payment::where('order_id', $order->order_id)->delete();
                Delivery::where('order_id', $order->order_id)->delete();
                $order->delete();
            }
            $dummy->delete();
        }

        // 2. Fetch Real Customers
        $customers = User::where('role', 'customer')->with('addresses')->get();

        if ($customers->isEmpty()) {
            $this->command->warn('No real customers found. Please create some customers in the system first.');
            return;
        }

        $sellers = Seller::with('products')->get();
        
        if ($sellers->isEmpty()) {
            $this->command->warn('No sellers found. Run SellerSeeder first.');
            return;
        }

        $statuses = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Rejected', 'Cancelled'];
        $activeStatuses = ['Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];
        
        $orderCount = 0;

        foreach ($sellers as $seller) {
            $products = $seller->products;
            if ($products->isEmpty()) {
                continue;
            }

            // Generate 5 orders per seller
            for ($i = 1; $i <= 5; $i++) {
                $status = $statuses[array_rand($statuses)];
                $paymentMethod = rand(0, 1) ? 'credit_card' : 'cash_on_delivery';
                $customer = $customers->random();
                
                $order = Order::create([
                    'user_id' => $customer->id,
                    'seller_id' => $seller->id,
                    'order_date' => Carbon::now()->subDays(rand(1, 15))->subHours(rand(1, 24)),
                    'order_status' => $status,
                    'customer_first_name' => $customer->first_name ?? 'Valued',
                    'customer_last_name' => $customer->last_name ?? 'Customer',
                    'customer_contact' => $customer->mobile_number ?? '09123456789',
                    'customer_email' => $customer->email,
                    'delivery_method' => 'delivery',
                    'payment_method' => $paymentMethod,
                    'payment_status' => in_array($status, ['Delivered', 'Out for Delivery']) ? 'paid' : 'pending',
                    'total_amount' => 0,
                ]);

                $total = 0;
                $numItems = rand(1, 3);
                
                for ($j = 0; $j < $numItems; $j++) {
                    $product = $products->random();
                    $qty = rand(1, 3);
                    
                    if (in_array($status, $activeStatuses)) {
                        $product->decrement('stock', $qty);
                    }
                    
                    $subtotal = $product->price * $qty;
                    $total += $subtotal;
                    
                    OrderItem::create([
                        'order_id' => $order->order_id,
                        'product_id' => $product->product_id,
                        'quantity' => $qty,
                        'subtotal' => $subtotal,
                    ]);
                }
                
                $order->update(['total_amount' => $total]);
                
                // Create Payment
                Payment::create([
                    'order_id' => $order->order_id,
                    'amount' => $total,
                    'method' => $paymentMethod,
                    'provider' => $paymentMethod === 'credit_card' ? 'stripe' : 'local',
                    'currency' => 'PHP',
                    'status' => $order->payment_status,
                ]);
                
                // Delivery
                $address = $customer->addresses->first();
                $latOffset = (rand(-20, 20) / 1000); 
                $lngOffset = (rand(-20, 20) / 1000);

                Delivery::create([
                    'order_id' => $order->order_id,
                    'street_address' => $address->street ?? 'Sample Street',
                    'barangay' => $address->barangay ?? ('Zone ' . rand(1, 5)),
                    'city' => $address->city ?? 'Digos City',
                    'province' => $address->province ?? 'Davao del Sur',
                    'dropoff_latitude' => $address->latitude ?? ($seller->latitude ? ($seller->latitude + $latOffset) : null),
                    'dropoff_longitude' => $address->longitude ?? ($seller->longitude ? ($seller->longitude + $lngOffset) : null),
                    'delivery_status' => $status,
                    'delivery_fee' => rand(50, 200),
                ]);

                $orderCount++;
            }
        }

        $this->command->info("Successfully generated {$orderCount} real-user sample orders.");
    }
}
