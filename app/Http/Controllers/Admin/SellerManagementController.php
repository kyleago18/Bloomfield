<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Seller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SellerManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Seller::with('user')->withCount('products');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn($q) => $q
                ->where('shop_name', 'like', "%{$search}%")
                ->orWhere('owner_name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
            );
        }

        return Inertia::render('Admin/Sellers/Index', [
            'sellers' => $query->latest()->paginate(20)->withQueryString(),
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function updateStatus(Request $request, Seller $seller): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected,suspended,pending',
        ]);

        $seller->update([
            'status'      => $validated['status'],
            'is_verified' => $validated['status'] === 'approved',
        ]);

        // Notify seller
        if ($seller->user_id) {
            $messages = [
                'approved'  => 'Congratulations! Your shop has been approved. You can now list products.',
                'rejected'  => 'Your shop application has been rejected. Please contact support for more information.',
                'suspended' => 'Your shop has been suspended. Please contact support.',
                'pending'   => 'Your shop status has been set to pending review.',
            ];

            Notification::create([
                'user_id' => $seller->user_id,
                'type'    => 'shop_status_changed',
                'title'   => 'Shop Status Updated',
                'body'    => $messages[$validated['status']],
                'data'    => ['status' => $validated['status']],
            ]);
        }

        return back()->with('success', 'Seller status updated to ' . $validated['status'] . '.');
    }
}
