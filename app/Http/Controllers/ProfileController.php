<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

use App\Models\Order;
use App\Models\ReplacementRequest;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        
        $orders = [];
        $addresses = [];
        
        $baseOrderQuery = Order::where('user_id', $user->id)
            ->with([
                'seller:id,shop_name,city,province,status,shop_logo',
                'orderItems' => fn($q) => $q
                    ->select(['order_id', 'product_id', 'quantity', 'subtotal'])
                    ->with([
                        'product:product_id,flower_name,name,thumbnail,price',
                        'product.reviews' => fn($rq) => $rq->where('user_id', $user->id)
                    ]),
                'delivery:order_id,delivery_status,street_address,barangay,city,province',
                'payment:order_id,method,status',
                'replacementRequest:id,order_id,status'
            ])
            ->where('deleted_by_buyer', false)
            ->select(['order_id', 'display_order_id', 'user_id', 'seller_id', 'total_amount', 'order_status', 'delivery_method', 'payment_method', 'payment_status', 'created_at', 'order_date', 'scheduled_date', 'special_requests', 'delivered_at'])
            ->latest();

        $active_purchases = (clone $baseOrderQuery)
            ->whereNotIn('order_status', ['Completed', 'Delivered', 'Cancelled'])
            ->whereNull('replacement_for_order_id') // Hide 0-cost replacement internal orders if we want, or keep them if they are active? Let's keep them since they are active deliveries! Wait, the previous logic hid them from purchases list: ->whereNull('replacement_for_order_id'). If we hide them, how will the user see the delivery status of their replacement? We should NOT hide them in active purchases! 
            ->paginate(15, ['*'], 'purchases_page');

        // Let's fix the above replacement logic to actually show active replacement orders.
        $active_purchases = (clone $baseOrderQuery)
            ->whereNotIn('order_status', ['Completed', 'Delivered', 'Cancelled'])
            ->paginate(15, ['*'], 'purchases_page');

        $completed_orders = (clone $baseOrderQuery)
            ->whereIn('order_status', ['Completed', 'Delivered', 'Cancelled'])
            ->paginate(15, ['*'], 'completed_page');
            
        $addresses = $user->addresses()->orderByDesc('is_default')->orderByDesc('created_at')->get();

        $sellerStats = [
            'products_count' => 0,
            'orders_count' => 0,
            'average_rating' => '0.0',
        ];

        if (in_array($user->role, ['seller', 'vendor_admin']) && $user->seller) {
            $sellerStats['products_count'] = $user->seller->products()->count();
            $sellerStats['orders_count'] = $user->seller->orders()->count();
            
            $avgRating = \App\Models\Review::whereHas('product', function($q) use ($user) {
                $q->where('seller_id', $user->seller->id);
            })->avg('rating');
            
            $sellerStats['average_rating'] = $avgRating > 0 ? number_format((float) $avgRating, 1, '.', '') : '0.0';
        }

        $userStats = [
            'orders_count' => $user->orders()->count(),
            'reviews_count' => $user->reviews()->count(),
        ];

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'purchases' => $active_purchases,
            'completed_orders' => $completed_orders,
            'addresses' => $addresses,
            'sellerStats' => $sellerStats,
            'userStats' => $userStats,
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $user->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $fileName = time() . '_' . $user->id . '.' . $file->getClientOriginalExtension();
            
            $destinationPath = public_path('uploads/avatars');
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }
            
            $file->move($destinationPath, $fileName);

            // Delete old avatar if it exists
            if ($user->avatar_url && str_starts_with($user->avatar_url, '/uploads/avatars/')) {
                $oldPath = public_path(ltrim($user->avatar_url, '/'));
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            $user->avatar_url = '/uploads/avatars/' . $fileName;
        }

        $user->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Update the user's avatar image.
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $fileName = time() . '_' . $user->id . '.' . $file->getClientOriginalExtension();
            
            $destinationPath = public_path('uploads/avatars');
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }
            
            $file->move($destinationPath, $fileName);

            // Delete old avatar if it exists
            if ($user->avatar_url && str_starts_with($user->avatar_url, '/uploads/avatars/')) {
                $oldPath = public_path(ltrim($user->avatar_url, '/'));
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            $user->avatar_url = '/uploads/avatars/' . $fileName;
            $user->save();
        }

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * Open a shop for the authenticated user.
     */
    public function openShop(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'shop_name'    => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
        ]);

        $user = $request->user();

        // Update user role
        $user->update(['role' => 'vendor_admin']);

        // Create seller profile
        \App\Models\Seller::create([
            'user_id'      => $user->id,
            'shop_name'    => $validated['shop_name'],
            'owner_name'   => $user->name,
            'email'        => $user->email,
            'phone_number' => $validated['phone_number'] ?? $user->phone_number,
            'status'       => 'unverified',
            'is_verified'  => false,
            'latitude'     => 6.7580, // Default for now
            'longitude'    => 125.3340, // Default for now
        ]);

        return redirect()->route('seller.verification');
    }
}
