<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        $shopId = DB::table('shops')->insertGetId([
            'name' => 'Test Bloom Shop',
            'description' => 'A wonderful shop for testing flowers.',
            'status' => 'approved',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('products')->insert([
            [
                'shop_id' => $shopId,
                'flower_name' => 'Red Roses Bouquet',
                'description' => 'A beautiful bouquet of a dozen red roses.',
                'price' => 45.99,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'shop_id' => $shopId,
                'flower_name' => 'White Lilies',
                'description' => 'Elegant white lilies for any occasion.',
                'price' => 30.50,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'shop_id' => $shopId,
                'flower_name' => 'Sunflowers',
                'description' => 'Bright and cheerful sunflowers.',
                'price' => 25.00,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
