<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\SellerFollower;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function show(Request $request, User $user): Response
    {
        $seller = auth()->user()->seller;

        if (!$seller) {
            abort(403, 'Seller profile not found.');
        }

        // Ownership check: the customer must have at least one order from this seller
        // or must be a follower of this seller — prevents sellers from accessing
        // arbitrary user profiles by guessing user IDs in the URL
        $hasRelationship = Order::where('seller_id', $seller->id)
            ->where('user_id', $user->id)
            ->exists();

        $isFollower = SellerFollower::where('seller_id', $seller->id)
            ->where('user_id', $user->id)
            ->exists();

        if (!$hasRelationship && !$isFollower) {
            abort(403, 'You can only view profiles of customers who have ordered from your shop or who follow you.');
        }

        // Load default or first address to get city and province only
        $address = $user->addresses()
            ->orderByDesc('is_default')
            ->first(['city', 'province']);

        // Orders placed by this customer with this specific seller
        $ordersQuery = Order::where('seller_id', $seller->id)
            ->where('user_id', $user->id);

        $totalOrdersCount = (clone $ordersQuery)->count();
        $completedOrdersCount = (clone $ordersQuery)->whereIn('order_status', ['Completed', 'Delivered'])->count();
        $lastOrder = (clone $ordersQuery)->latest('created_at')->first(['created_at', 'customer_contact']);

        $customerOrders = (clone $ordersQuery)
            ->latest('created_at')
            ->take(100)
            ->get(['order_id', 'display_order_id', 'total_amount', 'order_status', 'payment_status', 'created_at']);

        // Check if customer is following this seller
        $isFollowing = SellerFollower::where('seller_id', $seller->id)
            ->where('user_id', $user->id)
            ->exists();

        $followRecord = SellerFollower::where('seller_id', $seller->id)
            ->where('user_id', $user->id)
            ->first(['created_at']);

        $fullName = trim(($user->first_name ? ($user->first_name . ' ' . ($user->last_name ?? '')) : '') ?: ($user->name ?? 'Customer'));
        
        // Derive username/handle
        $username = $user->name ? strtolower(str_replace(' ', '', $user->name)) : (explode('@', $user->email)[0] ?? 'customer');

        // Contact number (from profile or from order contact)
        $contactNumber = $user->mobile_number ?: ($lastOrder?->customer_contact ?? null);

        $customerData = [
            'id'                => $user->id,
            'full_name'         => $fullName,
            'username'          => $username,
            'email'             => $user->email,
            'contact_number'    => $contactNumber,
            'avatar_url'        => $user->avatar_url,
            'city'              => $address?->city ?? null,
            'province'          => $address?->province ?? null,
            'member_since'      => $user->created_at ? $user->created_at->format('F Y') : null,
            'member_since_date' => $user->created_at ? $user->created_at->format('M d, Y') : null,
            'total_orders'      => $totalOrdersCount,
            'completed_orders'  => $completedOrdersCount,
            'last_order_date'   => $lastOrder?->created_at ? $lastOrder->created_at->format('M d, Y') : null,
            'is_following'      => $isFollowing,
            'followed_at'       => $followRecord?->created_at ? $followRecord->created_at->format('M d, Y') : null,
            'recent_orders'     => $customerOrders,
        ];

        return Inertia::render('Seller/Customers/Show', [
            'seller'   => $seller,
            'customer' => $customerData,
        ]);
    }
}
