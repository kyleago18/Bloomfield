<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class PetalsSeeder extends Seeder
{
    public function run(): void
    {
        // Clear old data (SQLite-safe)
        DB::table('order_items')->delete();
        DB::table('deliveries')->delete();
        DB::table('orders')->delete();
        DB::table('products')->delete();
        DB::table('users')->delete();
        DB::table('shops')->delete();

        $now = Carbon::now();

        // ──────────────────────────────────────────────
        // 1. Super Admin
        // ──────────────────────────────────────────────
        $superAdminId = DB::table('users')->insertGetId([
            'name'     => 'Super Admin',
            'email'    => 'superadmin@petals.com',
            'password' => Hash::make('password123'),
            'role'     => 'super_admin',
            'shop_id'  => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // ──────────────────────────────────────────────
        // 2. Shops
        // ──────────────────────────────────────────────
        $shop1Id = DB::table('shops')->insertGetId([
            'name'        => 'Hagonoy Blooms',
            'description' => 'Premium fresh flowers from the heart of Hagonoy, Davao del Sur. Specializing in roses, lilies, and elegant bouquets for every occasion.',
            'status'      => 'approved',
            'created_at'  => $now,
            'updated_at'  => $now,
        ]);

        $shop2Id = DB::table('shops')->insertGetId([
            'name'        => 'Davao Petal Boutique',
            'description' => 'Artisan flower arrangements and curated gift sets. We handpick the finest blooms from Davao\'s local farms.',
            'status'      => 'approved',
            'created_at'  => $now,
            'updated_at'  => $now,
        ]);

        // ──────────────────────────────────────────────
        // 3. Vendor Admin users (one per shop)
        // ──────────────────────────────────────────────
        $vendor1Id = DB::table('users')->insertGetId([
            'name'     => 'Maria Santos',
            'email'    => 'maria@hagonoyblooms.com',
            'password' => Hash::make('password123'),
            'role'     => 'vendor_admin',
            'shop_id'  => $shop1Id,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $vendor2Id = DB::table('users')->insertGetId([
            'name'     => 'Juan Reyes',
            'email'    => 'juan@davaopetal.com',
            'password' => Hash::make('password123'),
            'role'     => 'vendor_admin',
            'shop_id'  => $shop2Id,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // ──────────────────────────────────────────────
        // 4. Customer users
        // ──────────────────────────────────────────────
        $customer1Id = DB::table('users')->insertGetId([
            'name'     => 'Jane Doe',
            'email'    => 'jane.doe@gmail.com',
            'password' => Hash::make('password123'),
            'role'     => 'customer',
            'shop_id'  => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $customer2Id = DB::table('users')->insertGetId([
            'name'     => 'Carlo Cruz',
            'email'    => 'carlo.cruz@gmail.com',
            'password' => Hash::make('password123'),
            'role'     => 'customer',
            'shop_id'  => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // ──────────────────────────────────────────────
        // 5. Products — split between shops
        // ──────────────────────────────────────────────
        $shop1Flowers = [
            ['flower_name' => 'Red Roses Bouquet',  'price' => 29.99],
            ['flower_name' => 'Sunflowers',         'price' => 19.99],
            ['flower_name' => 'White Lilies',       'price' => 24.99],
            ['flower_name' => 'Carnations',         'price' => 15.99],
            ['flower_name' => 'Chrysanthemums',     'price' => 18.50],
        ];

        $shop2Flowers = [
            ['flower_name' => 'Tulips',    'price' => 22.00],
            ['flower_name' => 'Orchids',   'price' => 35.00],
            ['flower_name' => 'Peonies',   'price' => 32.50],
            ['flower_name' => 'Daisies',   'price' => 14.99],
            ['flower_name' => 'Hydrangeas','price' => 28.00],
        ];

        $shop1ProductIds = [];
        foreach ($shop1Flowers as $flower) {
            $shop1ProductIds[] = DB::table('products')->insertGetId([
                'shop_id'     => $shop1Id,
                'flower_name' => $flower['flower_name'],
                'description' => 'Beautiful ' . $flower['flower_name'] . ' — fresh from Hagonoy farms.',
                'price'       => $flower['price'],
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ], 'product_id');
        }

        $shop2ProductIds = [];
        foreach ($shop2Flowers as $flower) {
            $shop2ProductIds[] = DB::table('products')->insertGetId([
                'shop_id'     => $shop2Id,
                'flower_name' => $flower['flower_name'],
                'description' => 'Beautiful ' . $flower['flower_name'] . ' — handpicked by Davao Petal Boutique.',
                'price'       => $flower['price'],
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ], 'product_id');
        }

        // ──────────────────────────────────────────────
        // 6. Orders — correctly assigned to each shop
        // ──────────────────────────────────────────────
        $customerIds = [$customer1Id, $customer2Id];

        // Helper to generate orders for a specific shop
        $generateOrders = function (int $shopId, array $productIds, array $flowers, int $count) use ($customerIds, $now) {
            for ($i = 0; $i < $count; $i++) {
                $customerId = $customerIds[array_rand($customerIds)];
                $orderDate  = $now->copy()->subDays(rand(1, 365));
                $itemCount  = rand(1, min(4, count($productIds)));
                $totalAmount = 0;
                $itemsToInsert = [];

                // Pick random products from THIS shop only
                $selectedKeys = (array) array_rand($productIds, $itemCount);

                foreach ($selectedKeys as $key) {
                    $pid      = $productIds[$key];
                    $price    = $flowers[$key]['price'];
                    $quantity = rand(1, 3);
                    $itemTotal = $price * $quantity;
                    $totalAmount += $itemTotal;

                    $itemsToInsert[] = [
                        'product_id' => $pid,
                        'quantity'   => $quantity,
                        'subtotal'   => $itemTotal,
                        'created_at' => $orderDate,
                        'updated_at' => $orderDate,
                    ];
                }

                $orderId = DB::table('orders')->insertGetId([
                    'user_id'      => $customerId,
                    'shop_id'      => $shopId,
                    'order_date'   => $orderDate,
                    'total_amount' => $totalAmount,
                    'order_status' => ['Pending', 'Completed', 'Shipped', 'Cancelled'][rand(0, 3)],
                    'created_at'   => $orderDate,
                    'updated_at'   => $orderDate,
                ], 'order_id');

                foreach ($itemsToInsert as &$item) {
                    $item['order_id'] = $orderId;
                }
                DB::table('order_items')->insert($itemsToInsert);
            }
        };

        // 25 orders for Shop 1, 25 orders for Shop 2
        $generateOrders($shop1Id, $shop1ProductIds, $shop1Flowers, 25);
        $generateOrders($shop2Id, $shop2ProductIds, $shop2Flowers, 25);
    }
}
