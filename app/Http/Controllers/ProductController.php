<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Seller;
use App\Services\RecommendationService;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function show(Request $request, int $id, RecommendationService $recommendationService): Response
    {
        $product = Product::with([
                'seller:id,shop_name,city,province,latitude,longitude,status,is_verified,shop_logo',
                'category:id,name,slug',
                'reviews' => fn($q) => $q->with('user:id,name,avatar_url')->latest()->take(20),
            ])
            ->active()
            ->findOrFail($id);

        // Explicitly append images_url only on the detail page (removed from global $appends)
        $product->append(['images_url', 'effective_price', 'display_name', 'thumbnail_url']);


        // Related products: same category or same seller
        $related = Product::with([
                'seller:id,shop_name,city,province,status,shop_logo,is_verified',
                'category:id,name,slug',
            ])
            ->active()
            ->inStock()
            ->where('product_id', '!=', $product->product_id)
            ->where(fn($q) => $q
                ->where('category_id', $product->category_id)
                ->orWhere('seller_id', $product->seller_id)
            )
            ->select(['product_id', 'seller_id', 'category_id', 'name', 'flower_name', 'price', 'discount_price', 'stock', 'thumbnail', 'average_rating', 'reviews_count', 'sales_count'])
            ->take(8)
            ->get()
            ->append(['thumbnail_url', 'effective_price', 'display_name']);

        $sellerProducts = Product::with([
                'seller:id,shop_name,city,province,status,shop_logo,is_verified',
                'category:id,name,slug',
            ])
            ->active()
            ->inStock()
            ->where('seller_id', $product->seller_id)
            ->where('product_id', '!=', $product->product_id)
            ->select(['product_id', 'seller_id', 'category_id', 'name', 'flower_name', 'price', 'discount_price', 'stock', 'thumbnail', 'average_rating', 'reviews_count', 'sales_count'])
            ->take(6)
            ->get()
            ->append(['thumbnail_url', 'effective_price', 'display_name']);

        $hasPurchased = false;
        $hasReviewed  = false;

        if ($user = $request->user()) {
            $hasPurchased = \App\Models\OrderItem::whereHas('order', fn($q) => $q
                ->where('user_id', $user->id)
                ->whereIn('order_status', ['Delivered', 'Completed'])
            )->where('product_id', $product->product_id)->exists();

            $hasReviewed = \App\Models\Review::where('user_id', $user->id)
                ->where('product_id', $product->product_id)
                ->exists();
        }

        $frequentlyBoughtTogether = $recommendationService->getFrequentlyBoughtTogether($product);
        $completeYourGift = $recommendationService->getCompleteYourGift($product);

        return Inertia::render('Products/Show', [
            'product'        => $product,
            'hasPurchased'   => $hasPurchased,
            'hasReviewed'    => $hasReviewed,
            'related'        => $related,
            'sellerProducts' => $sellerProducts,
            'frequentlyBoughtTogether' => $frequentlyBoughtTogether,
            'completeYourGift'         => $completeYourGift,
            'auth'           => $request->user() ? ['user' => $request->user()] : null,
        ]);
    }
}
