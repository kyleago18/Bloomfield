<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SellerProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_seller_can_create_product_successfully(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['role' => 'vendor_admin']);
        $seller = Seller::create([
            'user_id'     => $user->id,
            'shop_name'   => 'Test Blossom Shop',
            'owner_name'  => $user->name,
            'email'       => $user->email,
            'status'      => 'approved',
            'is_verified' => true,
        ]);

        $category = Category::create([
            'name'        => 'Fresh Flowers',
            'slug'        => 'fresh-flowers',
            'is_active'   => true,
            'sort_order'  => 1,
        ]);

        $response = $this->actingAs($user)->post(route('seller.products.store'), [
            'flower_name'        => 'Royal Red Bouquet',
            'description'        => 'Gorgeous red roses.',
            'category_id'        => (string) $category->id,
            'price'              => '450.00',
            'discount_price'     => '',
            'stock'              => '15',
            'sku'                => '',
            'flower_type'        => 'Roses',
            'occasion'           => 'Anniversary',
            'delivery_available' => true,
            'pickup_available'   => true,
            'is_active'          => true,
            'thumbnail'          => UploadedFile::fake()->image('roses.jpg'),
        ]);

        $response->assertRedirect(route('seller.products.index'));

        $this->assertDatabaseHas('products', [
            'seller_id'   => $seller->id,
            'flower_name' => 'Royal Red Bouquet',
            'price'       => 450.00,
            'stock'       => 15,
        ]);
    }
}
