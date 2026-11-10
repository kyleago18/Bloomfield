<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\Seller;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Delivery;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Str;

class RecommendationTestDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Categories
        $flowersCategory = Category::updateOrCreate(
            ['slug' => 'flowers'],
            [
                'name' => 'Flowers & Bouquets',
                'description' => 'Beautiful fresh cuts and flower arrangements.',
                'is_active' => true,
                'is_addon' => false,
                'sort_order' => 1,
            ]
        );

        $addonsCategory = Category::updateOrCreate(
            ['slug' => 'add-ons'],
            [
                'name' => 'Complementary Add-ons',
                'description' => 'Chocolates, cards, vases, and more to complete your gift.',
                'is_active' => true,
                'is_addon' => true,
                'sort_order' => 2,
            ]
        );

        // 2. Assign all existing products to the Flowers category
        Product::whereNull('category_id')->update([
            'category_id' => $flowersCategory->id,
            'is_addon' => false,
        ]);

        // 3. Ensure we have sellers
        $sellers = Seller::all();
        if ($sellers->isEmpty()) {
            $this->command->warn('No sellers found. Running SellerSeeder first...');
            $this->call(SellerSeeder::class);
            $sellers = Seller::all();
        }

        // Get the test customer
        $customer = User::where('role', 'customer')->first();
        if (!$customer) {
            $customer = User::create([
                'name' => 'Kyle Ago',
                'first_name' => 'Kyle',
                'last_name' => 'Ago',
                'email' => 'kyleago182002@gmail.com',
                'password' => bcrypt('password123'),
                'role' => 'customer',
            ]);
        }

        // 4. Create Add-on Products for each seller
        $addonTemplates = [
            [
                'name' => 'Chocolate Gift Box',
                'flower_name' => 'Ferrero Rocher Chocolates',
                'price' => 350.00,
                'description' => 'Premium box of Ferrero Rocher chocolates to satisfy their sweet tooth.',
                'sku_prefix' => 'CHOC',
                'thumbnail' => 'images/ferrero_rocher_box_purple_ribbon.png',
            ],
            [
                'name' => 'Classic Teddy Bear',
                'flower_name' => 'Fluffy Cuddly Teddy Bear',
                'price' => 450.00,
                'description' => 'A cute, soft plush teddy bear to express your affection.',
                'sku_prefix' => 'TEDY',
                'thumbnail' => 'images/fathers_day_balloon_chocolate_bouquet.png',
            ],
            [
                'name' => 'Greeting Card',
                'flower_name' => 'Elegant Ribbon Greeting Card',
                'price' => 100.00,
                'description' => 'A beautifully designed card to write your personal custom message.',
                'sku_prefix' => 'CARD',
                'thumbnail' => 'images/pink_roses_chantelle_collection.png',
            ],
            [
                'name' => 'Luxury Glass Vase',
                'flower_name' => 'Crystal Clear Glass Vase',
                'price' => 600.00,
                'description' => 'A clear, premium glass vase to showcase your beautiful flower bouquet.',
                'sku_prefix' => 'VASE',
                'thumbnail' => 'images/podium_floral_arrangement_1.png',
            ],
            [
                'name' => 'Red Satin Ribbon',
                'flower_name' => 'Red Satin Ribbon Wrap',
                'price' => 50.00,
                'description' => 'An extra touch of elegant red satin ribbon wrapped around your bouquet.',
                'sku_prefix' => 'RIBN',
                'thumbnail' => 'images/colorful_carnation_rose_bouquet.png',
            ],
        ];

        $sellerAddons = []; // Map seller_id => array of addon products

        foreach ($sellers as $seller) {
            $sellerAddons[$seller->id] = [];
            foreach ($addonTemplates as $tpl) {
                $addon = Product::updateOrCreate(
                    [
                        'seller_id' => $seller->id,
                        'name' => $tpl['name'],
                        'category_id' => $addonsCategory->id,
                    ],
                    [
                        'flower_name' => $tpl['flower_name'],
                        'description' => $tpl['description'],
                        'price' => $tpl['price'],
                        'stock' => 100,
                        'sku' => $tpl['sku_prefix'] . '-' . strtoupper(Str::random(6)),
                        'is_active' => true,
                        'is_addon' => true,
                        'thumbnail' => $tpl['thumbnail'],
                        'delivery_available' => true,
                        'pickup_available' => true,
                    ]
                );
                $sellerAddons[$seller->id][$tpl['sku_prefix']] = $addon;
            }
        }

        $this->command->info("Created add-on products for all shops.");

        // 5. Generate high-quality mixed transaction data to create strong rules
        // Clear old orders and order items to get clean Apriori training data
        OrderItem::query()->delete();
        Payment::query()->delete();
        Delivery::query()->delete();
        Order::query()->delete();

        $orderCount = 0;
        $now = Carbon::now();

        foreach ($sellers as $seller) {
            $flowerProducts = Product::where('seller_id', $seller->id)->where('is_addon', false)->get();
            $addons = $sellerAddons[$seller->id] ?? [];

            if ($flowerProducts->isEmpty() || empty($addons)) {
                continue;
            }

            // Find specific flowers for setting up patterns
            $valentina = $flowerProducts->firstWhere('flower_name', 'Valentina') ?? $flowerProducts->get(0);
            $calista = $flowerProducts->firstWhere('flower_name', 'Calista') ?? $flowerProducts->get(1);
            $ember = $flowerProducts->firstWhere('flower_name', 'Ember') ?? $flowerProducts->get(2);
            $passion = $flowerProducts->firstWhere('flower_name', 'Passion') ?? $flowerProducts->get(3);

            // Fetch add-ons
            $choc = $addons['CHOC'] ?? null;
            $teddy = $addons['TEDY'] ?? null;
            $card = $addons['CARD'] ?? null;
            $vase = $addons['VASE'] ?? null;
            $ribn = $addons['RIBN'] ?? null;

            // Generate 80 mixed orders per seller to create distinct association patterns
            for ($i = 0; $i < 80; $i++) {
                $orderDate = $now->copy()->subDays(rand(1, 100))->subHours(rand(1, 24));
                $items = [];

                // We distribute items based on probability to establish clear rules:
                $r = rand(1, 100);

                if ($valentina && $r <= 35) {
                    // Pattern A: Valentina + Chocolate Box (Support: ~35%, Confidence: ~70% Valentina -> Choc)
                    $items[] = $valentina;
                    if (rand(1, 10) <= 7 && $choc) {
                        $items[] = $choc;
                        // Sub-pattern: Valentina + Choc + Greeting Card (Confidence: ~60% {Valentina, Choc} -> Card)
                        if (rand(1, 10) <= 6 && $card) {
                            $items[] = $card;
                        }
                    }
                } elseif ($calista && $r > 35 && $r <= 60) {
                    // Pattern B: Calista + Teddy Bear (Support: ~25%, Confidence: ~60% Calista -> Teddy)
                    $items[] = $calista;
                    if (rand(1, 10) <= 6 && $teddy) {
                        $items[] = $teddy;
                    }
                } elseif ($ember && $r > 60 && $r <= 80) {
                    // Pattern C: Ember + Glass Vase (Support: ~20%, Confidence: ~50% Ember -> Vase)
                    $items[] = $ember;
                    if (rand(1, 10) <= 5 && $vase) {
                        $items[] = $vase;
                    }
                } else {
                    // Pattern D: Passion + Valentina (Flower -> Flower) OR Random Mixture
                    if ($passion && rand(0, 1) === 1) {
                        $items[] = $passion;
                        if ($valentina && rand(1, 10) <= 6) {
                            $items[] = $valentina;
                        }
                    } else {
                        // Pick 1-2 random flower products
                        $randomFlowers = $flowerProducts->random(min(2, $flowerProducts->count()));
                        foreach ($randomFlowers as $rf) {
                            $items[] = $rf;
                        }
                        // Add a random add-on 50% of the time
                        if (rand(0, 1) === 1 && !empty($addons)) {
                            $items[] = collect($addons)->random();
                        }
                    }
                }

                // De-duplicate items
                $uniqueItemIds = [];
                $finalItems = [];
                foreach ($items as $item) {
                    $pid = $item->product_id ?? $item->id;
                    if (!in_array($pid, $uniqueItemIds)) {
                        $uniqueItemIds[] = $pid;
                        $finalItems[] = $item;
                    }
                }

                if (empty($finalItems)) {
                    continue;
                }

                // Create the Order
                $order = Order::create([
                    'user_id' => $customer->id,
                    'seller_id' => $seller->id,
                    'order_date' => $orderDate,
                    'order_status' => 'Completed',
                    'customer_first_name' => $customer->first_name ?: 'Test',
                    'customer_last_name' => $customer->last_name ?: 'Customer',
                    'customer_contact' => '09123456789',
                    'customer_email' => $customer->email,
                    'receiver_first_name' => $customer->first_name ?: 'Test',
                    'receiver_last_name' => $customer->last_name ?: 'Customer',
                    'receiver_contact' => '09123456789',
                    'receiver_email' => $customer->email,
                    'delivery_method' => 'delivery',
                    'payment_method' => 'Cash on Delivery',
                    'payment_status' => 'Paid',
                    'total_amount' => 0,
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);

                $total = 0;
                foreach ($finalItems as $prod) {
                    $qty = 1;
                    $price = $prod->effective_price ?? $prod->price;
                    $subtotal = $price * $qty;
                    $total += $subtotal;

                    OrderItem::create([
                        'order_id' => $order->order_id ?? $order->id,
                        'product_id' => $prod->product_id ?? $prod->id,
                        'quantity' => $qty,
                        'subtotal' => $subtotal,
                        'created_at' => $orderDate,
                        'updated_at' => $orderDate,
                    ]);
                }

                $deliveryFee = 100.00;
                $total += $deliveryFee;
                $order->update(['total_amount' => $total]);

                Payment::create([
                    'order_id' => $order->order_id ?? $order->id,
                    'amount' => $total,
                    'method' => 'cash_on_delivery',
                    'provider' => 'local',
                    'currency' => 'PHP',
                    'status' => 'Paid',
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);

                Delivery::create([
                    'order_id' => $order->order_id ?? $order->id,
                    'street_address' => '123 Rizal St',
                    'city' => 'Digos City',
                    'province' => 'Davao del Sur',
                    'delivery_fee' => $deliveryFee,
                    'delivery_status' => 'Delivered',
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);

                $orderCount++;
            }
        }

        $this->command->info("Seeded {$orderCount} orders with mixed flowers and add-ons for Apriori testing.");
    }
}
