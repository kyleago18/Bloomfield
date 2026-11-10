<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class RecommendationController extends Controller
{
    /**
     * Apriori-based "Frequently Bought Together" recommendations.
     *
     * Given a product_id, this method:
     *   1. Finds all orders that contain that product (support).
     *   2. Counts how often each *other* product appears in those same orders (confidence).
     *   3. Returns the top 3 co-purchased products sorted by frequency.
     */
    public function show(int $product)
    {
        // Step 1: Find all order_ids that contain the target product
        $orderIds = DB::table('order_items')
            ->where('product_id', $product)
            ->pluck('order_id');

        if ($orderIds->isEmpty()) {
            // Fallback: return popular add-ons from the same seller
            return response()->json($this->fallbackAddons($product));
        }

        // Step 2: In those orders, count the frequency of every *other* ADD-ON product
        $recommendations = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.product_id')
            ->whereIn('order_items.order_id', $orderIds)
            ->where('order_items.product_id', '!=', $product)
            ->where('products.is_active', true)
            ->where('products.is_addon', true)
            ->select(
                'products.product_id',
                'products.flower_name',
                'products.price',
                'products.image_url',
                'products.is_addon',
                DB::raw('COUNT(DISTINCT order_items.order_id) as frequency')
            )
            ->groupBy('products.product_id', 'products.flower_name', 'products.price', 'products.image_url', 'products.is_addon')
            ->orderByDesc('frequency')
            ->limit(3)
            ->get();

        // Step 3: Add confidence score
        $totalOrders = $orderIds->count();
        $recommendations->transform(function ($item) use ($totalOrders) {
            $item->confidence = round($item->frequency / $totalOrders, 2);
            return $item;
        });

        // Step 4: If not enough add-on recommendations, fill with popular add-ons from same seller
        if ($recommendations->count() < 3) {
            $needed = 3 - $recommendations->count();
            $excludeIds = $recommendations->pluck('product_id')->push($product)->toArray();

            $sellerId = DB::table('products')->where('product_id', $product)->value('seller_id');

            $fallbacks = DB::table('products')
                ->where('seller_id', $sellerId)
                ->where('is_active', true)
                ->where('is_addon', true)
                ->whereNotIn('product_id', $excludeIds)
                ->whereNull('deleted_at')
                ->select('product_id', 'flower_name', 'price', 'image_url', 'is_addon')
                ->orderByDesc('created_at')
                ->limit($needed)
                ->get();

            $recommendations = $recommendations->concat($fallbacks);
        }

        return response()->json($recommendations);
    }

    /**
     * Fallback: return popular add-ons from the same seller when no order history exists.
     */
    private function fallbackAddons(int $productId): array
    {
        $sellerId = DB::table('products')->where('product_id', $productId)->value('seller_id');

        return DB::table('products')
            ->where('seller_id', $sellerId)
            ->where('is_active', true)
            ->where('is_addon', true)
            ->where('product_id', '!=', $productId)
            ->whereNull('deleted_at')
            ->select('product_id', 'flower_name', 'price', 'image_url', 'is_addon')
            ->orderByDesc('created_at')
            ->limit(3)
            ->get()
            ->toArray();
    }
}
