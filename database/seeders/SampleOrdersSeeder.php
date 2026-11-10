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

class SampleOrdersSeeder extends Seeder
{
    public function run(): void
    {
        $sellers = Seller::with('products')->get();
        
        if ($sellers->isEmpty()) {
            $this->command->warn('No sellers found. Run SellerSeeder first.');
            return;
        }

        $customer = User::firstOrCreate(
            ['email' => 'sample.customer@gmail.com'],
            ['name' => 'Sample Buyer', 'password' => bcrypt('password'), 'role' => 'customer']
        );
        
        $statuses = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Rejected', 'Cancelled'];
        $activeStatuses = ['Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];
        
        $orderCount = 0;

        foreach ($sellers as $seller) {
            $products = $seller->products;
            
            // Generate 5 orders per seller
            for ($i = 1; $i <= 5; $i++) {
                if ($products->isEmpty()) {
                    continue;
                }

                $status = $statuses[array_rand($statuses)];
                $paymentMethod = rand(0, 1) ? 'GCash' : 'cash_on_delivery';
                
                $order = Order::create([
                    'user_id' => $customer->id,
                    'seller_id' => $seller->id,
                    'order_date' => Carbon::now()->subDays(rand(1, 15))->subHours(rand(1, 24)),
                    'order_status' => $status,
                    'customer_first_name' => 'Sample',
                    'customer_last_name' => 'Buyer ' . $i,
                    'customer_contact' => '09123456789',
                    'customer_email' => 'sample.customer@gmail.com',
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
                    'provider' => $paymentMethod === 'GCash' ? 'stripe' : 'local',
                    'currency' => 'PHP',
                    'status' => $order->payment_status,
                ]);
                
                // Create Delivery with offset coordinates (~1km-3km)
                $latOffset = (rand(-20, 20) / 1000); 
                $lngOffset = (rand(-20, 20) / 1000);
                
                Delivery::create([
                    'order_id' => $order->order_id,
                    'street_address' => 'Sample Street',
                    'barangay' => 'Zone ' . rand(1, 5),
                    'city' => 'Digos City',
                    'province' => 'Davao del Sur',
                    'dropoff_latitude' => $seller->latitude ? ($seller->latitude + $latOffset) : null,
                    'dropoff_longitude' => $seller->longitude ? ($seller->longitude + $lngOffset) : null,
                    'delivery_status' => $status,
                    'delivery_fee' => rand(50, 200),
                ]);

                $orderCount++;
            }
        }

        $this->command->info("Successfully generated {$orderCount} sample orders.");
    }
}
