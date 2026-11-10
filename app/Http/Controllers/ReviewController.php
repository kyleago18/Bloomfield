<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, int $productId): RedirectResponse
    {
        $user    = $request->user();
        $product = Product::findOrFail($productId);

        // Only verified buyers can review
        $hasPurchased = OrderItem::whereHas('order', fn($q) => $q
            ->where('user_id', $user->id)
            ->whereIn('order_status', ['Delivered', 'Completed'])
        )->where('product_id', $productId)->exists();

        if (!$hasPurchased) {
            return back()->withErrors(['review' => 'You can only review products you have purchased.']);
        }

        // One review per product per user
        $existingReview = Review::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();

        if ($existingReview) {
            return back()->withErrors(['review' => 'You have already reviewed this product.']);
        }

        $validated = $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:2000',
        ]);

        Review::create([
            'user_id'               => $user->id,
            'product_id'            => $productId,
            'rating'                => $validated['rating'],
            'comment'               => $validated['comment'] ?? null,
            'is_verified_purchase'  => true,
        ]);

        // Notify the seller
        if ($product->seller && $product->seller->user_id) {
            Notification::create([
                'user_id'   => $product->seller->user_id,
                'type'      => 'new_review',
                'title'     => 'New Review on ' . ($product->name ?? $product->flower_name),
                'body'      => $user->name . ' left a ' . $validated['rating'] . '-star review.',
                'data'      => [
                    'product_id'    => $productId,
                    'rating'        => $validated['rating'],
                    'customer_name' => $user->name,
                    'comment'       => $validated['comment'] ?? '',
                ],
                'seller_id' => $product->seller_id,
            ]);
        }

        return back()->with('success', 'Review submitted successfully.');
    }

    public function sellerReply(Request $request, int $reviewId): RedirectResponse
    {
        $review = Review::findOrFail($reviewId);
        $seller = auth()->user()->seller;

        // Ensure seller owns the product
        if (!$seller || $review->product->seller_id !== $seller->id) {
            abort(403);
        }

        $validated = $request->validate([
            'seller_reply' => 'required|string|max:1000',
        ]);

        $review->update([
            'seller_reply'      => $validated['seller_reply'],
            'seller_replied_at' => now(),
        ]);

        return back()->with('success', 'Reply posted.');
    }
}
