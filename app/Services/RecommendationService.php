<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

class RecommendationService
{
    protected float $minSupport = 0.05;
    protected float $minConfidence = 0.10;

    /**
     * Get Frequently Bought Together recommendations (Apriori + Popularity fallbacks)
     * Mined from the same seller's transactions.
     */
    public function getFrequentlyBoughtTogether(Product $product, int $limit = 4): array
    {
        $productId = $product->product_id;
        $sellerId = $product->seller_id;

        // 1. Fetch historical completed transactions for this seller
        $orders = Order::where('seller_id', $sellerId)
            ->whereIn('order_status', ['Completed', 'Shipped', 'Processing'])
            ->with('orderItems:order_id,product_id')
            ->get();

        $transactions = [];
        foreach ($orders as $order) {
            $itemIds = $order->orderItems->pluck('product_id')->unique()->toArray();
            if (count($itemIds) > 1) {
                $transactions[] = $itemIds;
            }
        }

        // Run Apriori rule mining for this target product
        $aprioriIds = $this->mineAprioriRules($transactions, $productId);

        // Fetch the product models
        $recommendedProducts = Product::with([
                'seller:id,shop_name,city,province,status,shop_logo,is_verified',
                'category:id,name,slug'
            ])
            ->active()
            ->inStock()
            ->whereNull('deleted_at')
            ->where('seller_id', $sellerId)
            ->where('product_id', '!=', $productId)
            ->whereIn('product_id', $aprioriIds)
            ->get();

        // Sort them in the exact order mined by Apriori (which is ranked by confidence)
        $recommendedProducts = $recommendedProducts->sortBy(function ($p) use ($aprioriIds) {
            return array_search($p->product_id, $aprioriIds);
        })->values();

        // 2. Cold-Start/Fallback logic: fill up with popular products from the same seller
        if ($recommendedProducts->count() < $limit) {
            $needed = $limit - $recommendedProducts->count();
            $excludeIds = $recommendedProducts->pluck('product_id')->push($productId)->toArray();

            $fallbacks = Product::with([
                    'seller:id,shop_name,city,province,status,shop_logo,is_verified',
                    'category:id,name,slug'
                ])
                ->active()
                ->inStock()
                ->whereNull('deleted_at')
                ->where('seller_id', $sellerId)
                ->whereNotIn('product_id', $excludeIds)
                ->select(['products.*', DB::raw('(SELECT COUNT(*) FROM order_items WHERE order_items.product_id = products.product_id) as sales_count')])
                ->orderByDesc('sales_count')
                ->orderByDesc('created_at')
                ->take($needed)
                ->get();

            $recommendedProducts = $recommendedProducts->concat($fallbacks)->values();
        }

        return $recommendedProducts->take($limit)->map(function ($p) {
            return $p->append(['thumbnail_url', 'effective_price', 'display_name'])->toArray();
        })->toArray();
    }

    /**
     * Get Complete Your Gift suggestions (Add-on rules + Fallback add-ons)
     * Scoped to the same seller.
     */
    public function getCompleteYourGift(Product $product, int $limit = 4): array
    {
        $productId = $product->product_id;
        $sellerId = $product->seller_id;

        // 1. Fetch completed orders for this seller
        $orders = Order::where('seller_id', $sellerId)
            ->whereIn('order_status', ['Completed', 'Shipped', 'Processing'])
            ->with('orderItems:order_id,product_id')
            ->get();

        $transactions = [];
        foreach ($orders as $order) {
            $itemIds = $order->orderItems->pluck('product_id')->unique()->toArray();
            if (count($itemIds) > 1) {
                $transactions[] = $itemIds;
            }
        }

        // Run Apriori rule mining to find products purchased with the viewed item
        $aprioriIds = $this->mineAprioriRules($transactions, $productId);

        // Filter these recommended product IDs to ONLY include add-ons
        $recommendedAddons = Product::with([
                'seller:id,shop_name,city,province,status,shop_logo,is_verified',
                'category:id,name,slug'
            ])
            ->active()
            ->inStock()
            ->whereNull('deleted_at')
            ->where('seller_id', $sellerId)
            ->where('product_id', '!=', $productId)
            ->where('is_addon', true)
            ->whereIn('product_id', $aprioriIds)
            ->get();

        $recommendedAddons = $recommendedAddons->sortBy(function ($p) use ($aprioriIds) {
            return array_search($p->product_id, $aprioriIds);
        })->values();

        // 2. Cold-Start/Fallback logic: fill up with available add-on products from the same seller
        if ($recommendedAddons->count() < $limit) {
            $needed = $limit - $recommendedAddons->count();
            $excludeIds = $recommendedAddons->pluck('product_id')->push($productId)->toArray();

            $fallbacks = Product::with([
                    'seller:id,shop_name,city,province,status,shop_logo,is_verified',
                    'category:id,name,slug'
                ])
                ->active()
                ->inStock()
                ->whereNull('deleted_at')
                ->where('seller_id', $sellerId)
                ->where('is_addon', true)
                ->whereNotIn('product_id', $excludeIds)
                ->select(['products.*', DB::raw('(SELECT COUNT(*) FROM order_items WHERE order_items.product_id = products.product_id) as sales_count')])
                ->orderByDesc('sales_count')
                ->take($needed)
                ->get();

            $recommendedAddons = $recommendedAddons->concat($fallbacks)->values();
        }

        return $recommendedAddons->take($limit)->map(function ($p) {
            return $p->append(['thumbnail_url', 'effective_price', 'display_name'])->toArray();
        })->toArray();
    }

    /**
     * Implementation of the Apriori Algorithm to find related product IDs.
     * Returns an array of product IDs sorted by relevance (confidence).
     */
    private function mineAprioriRules(array $transactions, int $targetProductId): array
    {
        $totalTransactions = count($transactions);
        if ($totalTransactions === 0) {
            return [];
        }

        // Count support for individual products
        $itemCounts = [];
        foreach ($transactions as $t) {
            foreach ($t as $itemId) {
                $itemCounts[$itemId] = ($itemCounts[$itemId] ?? 0) + 1;
            }
        }

        $minSupportCount = max(1, $this->minSupport * $totalTransactions);

        // Count support for item pairs (2-itemsets) containing the target product
        $pairCounts = [];
        foreach ($transactions as $t) {
            if (in_array($targetProductId, $t)) {
                foreach ($t as $otherId) {
                    if ($otherId !== $targetProductId) {
                        $pairCounts[$otherId] = ($pairCounts[$otherId] ?? 0) + 1;
                    }
                }
            }
        }

        // Generate rules: targetProductId -> otherId
        // Confidence = support(targetProductId, otherId) / support(targetProductId)
        $supportTarget = $itemCounts[$targetProductId] ?? 0;
        if ($supportTarget === 0) {
            return [];
        }

        $rules = [];
        foreach ($pairCounts as $otherId => $count) {
            if ($count >= $minSupportCount) {
                $confidence = $count / $supportTarget;
                if ($confidence >= $this->minConfidence) {
                    $rules[] = [
                        'product_id' => $otherId,
                        'confidence' => $confidence,
                        'support' => $count / $totalTransactions
                    ];
                }
            }
        }

        // Sort rules by confidence descending, then support descending
        usort($rules, function ($a, $b) {
            if ($a['confidence'] == $b['confidence']) {
                return $b['support'] <=> $a['support'];
            }
            return $b['confidence'] <=> $a['confidence'];
        });

        return array_column($rules, 'product_id');
    }
}
