<?php

namespace App\Observers;

use App\Models\Review;
use App\Models\Product;
use App\Models\Seller;

class ReviewObserver
{
    public function saved(Review $review): void
    {
        $this->updateAggregates($review);
    }

    public function deleted(Review $review): void
    {
        $this->updateAggregates($review);
    }

    private function updateAggregates(Review $review): void
    {
        if ($review->product_id) {
            $product = Product::find($review->product_id);
            if ($product) {
                $product->reviews_count = Review::where('product_id', $review->product_id)->count();
                $product->average_rating = Review::where('product_id', $review->product_id)->avg('rating') ?? 0;
                $product->saveQuietly();
                
                if ($product->seller_id) {
                    $sellerId = $product->seller_id;
                    $productIds = Product::where('seller_id', $sellerId)->pluck('product_id');
                    
                    $seller = Seller::find($sellerId);
                    if ($seller) {
                        $seller->reviews_count = Review::whereIn('product_id', $productIds)->count();
                        $seller->average_rating = Review::whereIn('product_id', $productIds)->avg('rating') ?? 0;
                        $seller->saveQuietly();
                    }
                }
            }
        }
    }
}
