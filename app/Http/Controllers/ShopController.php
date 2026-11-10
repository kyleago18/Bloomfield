<?php

namespace App\Http\Controllers;

use App\Models\Seller;
use App\Models\SellerFollower;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function show(Request $request, int $id): Response
    {
        $seller = Seller::with(['products' => fn($q) => $q
                ->active()
                ->inStock()
                ->where('is_addon', false)
                ->with([
                    'category:id,name,slug',
                    'seller:id,shop_name,city,province,status,shop_logo,is_verified'
                ])
                ->latest()
                ->take(20) // Limit to 20 products; load more via separate request if needed
                ->select(['product_id', 'seller_id', 'category_id', 'name', 'flower_name', 'price', 'discount_price', 'stock', 'thumbnail', 'is_active', 'delivery_available', 'pickup_available', 'reviews_count', 'average_rating', 'sales_count', 'created_at'])
            ])
            ->withCount('followers')
            ->where('status', 'approved')
            ->findOrFail($id);

        $seller->products->each(function ($product) {
            $product->append(['thumbnail_url', 'effective_price', 'display_name']);
        });

        $following = false;
        if ($request->user()) {
            $following = SellerFollower::where('user_id', $request->user()->id)
                ->where('seller_id', $seller->id)
                ->exists();
        }

        $recentFollowers = SellerFollower::where('seller_id', $seller->id)
            ->with(['user:id,name,first_name,last_name,avatar_url'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'user_id', 'seller_id', 'created_at']);

        return Inertia::render('Sellers/Show', [
            'seller'           => $seller,
            'following'        => $following,
            'recent_followers' => $recentFollowers,
            'categories_list'  => \App\Models\Category::where('is_active', true)->orderBy('sort_order')->get(['id', 'name']),
            'auth'             => $request->user() ? ['user' => $request->user()] : null,
        ]);
    }

    public function toggleFollow(Request $request, int $id): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'Your role cannot follow shops.'], 403);
        }

        $seller = Seller::findOrFail($id);

        if ($seller->user_id === $user->id) {
            return response()->json(['message' => 'You cannot follow your own shop.'], 403);
        }

        $existing = SellerFollower::where('user_id', $user->id)->where('seller_id', $id)->first();

        if ($existing) {
            $existing->delete();

            // Delete the follower notification for this seller from this user
            if ($seller->user_id) {
                Notification::where('user_id', $seller->user_id)
                    ->where('type', 'new_follower')
                    ->where('seller_id', $seller->id)
                    ->whereJsonContains('data->follower_id', $user->id)
                    ->delete();
            }

            $count = SellerFollower::where('seller_id', $id)->count();
            $recentFollowers = SellerFollower::where('seller_id', $id)
                ->with(['user:id,name,first_name,last_name,avatar_url'])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get(['id', 'user_id', 'seller_id', 'created_at']);

            return response()->json([
                'following'        => false,
                'follower_count'   => $count,
                'recent_followers' => $recentFollowers,
            ]);
        }

        SellerFollower::create([
            'user_id' => $user->id,
            'seller_id' => $id,
        ]);

        // Create new follower notification
        if ($seller->user_id && $seller->user_id !== $user->id) {
            $alreadyNotified = Notification::where('user_id', $seller->user_id)
                ->where('type', 'new_follower')
                ->where('seller_id', $seller->id)
                ->whereJsonContains('data->follower_id', $user->id)
                ->exists();

            if (!$alreadyNotified) {
                Notification::create([
                    'user_id'   => $seller->user_id,
                    'type'      => 'new_follower',
                    'title'     => 'New Follower',
                    'body'      => $user->name . ' started following your shop.',
                    'data'      => [
                        'follower_id'   => $user->id,
                        'follower_name' => $user->name,
                        'seller_id'     => $seller->id,
                        'shop_name'     => $seller->shop_name,
                    ],
                    'seller_id' => $seller->id,
                ]);
            }
        }

        $count = SellerFollower::where('seller_id', $id)->count();
        $recentFollowers = SellerFollower::where('seller_id', $id)
            ->with(['user:id,name,first_name,last_name,avatar_url'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'user_id', 'seller_id', 'created_at']);

        return response()->json([
            'following'        => true,
            'follower_count'   => $count,
            'recent_followers' => $recentFollowers,
        ]);
    }
}
