<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class VerificationController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $seller = $request->user()->seller;

        if ($seller->isPending()) {
            return redirect()->route('seller.verification.pending');
        }

        if ($seller->isApproved()) {
            return redirect()->route('seller.dashboard');
        }

        return Inertia::render('Seller/Verification', [
            'seller' => $seller,
            'rejection_reason' => $seller->rejection_reason,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $seller = $request->user()->seller;

        if ($seller->isPending() || $seller->isApproved()) {
            return redirect()->route('seller.dashboard');
        }

        $validated = $request->validate([
            'id_type' => 'required|string|max:255',
            'id_photo' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
            'business_permit' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240',
            'storefront_photo' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240',
            'bank_name' => 'required|string|max:255',
            'bank_account_name' => 'required|string|max:255',
            'bank_account_number' => 'required|string|max:255',
        ]);

        // Security Critical: Store in local (private) disk
        $seller->id_type = $validated['id_type'];
        $seller->id_photo_path = $request->file('id_photo')->store('seller_docs', 'local');
        
        if ($request->hasFile('business_permit')) {
            $seller->business_permit_path = $request->file('business_permit')->store('seller_docs', 'local');
        }
        
        if ($request->hasFile('storefront_photo')) {
            $seller->storefront_photo_path = $request->file('storefront_photo')->store('seller_docs', 'local');
        }

        $seller->bank_name = $validated['bank_name'];
        $seller->bank_account_name = $validated['bank_account_name'];
        $seller->bank_account_number = $validated['bank_account_number'];
        $seller->status = 'pending';
        $seller->rejection_reason = null; // Clear previous rejection reason
        $seller->save();

        return redirect()->route('seller.verification.pending')->with('success', 'Documents submitted successfully. Your shop is now under review.');
    }

    public function pending(Request $request): Response|RedirectResponse
    {
        $seller = $request->user()->seller;

        if ($seller->isApproved()) {
            return redirect()->route('seller.dashboard');
        }

        if ($seller->isUnverified() || $seller->isRejected()) {
            return redirect()->route('seller.verification');
        }

        return Inertia::render('Seller/PendingReview', [
            'seller' => $seller,
        ]);
    }
}
