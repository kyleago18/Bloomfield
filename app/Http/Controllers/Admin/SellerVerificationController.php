<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Seller;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use App\Mail\SellerApprovedMail;
use App\Mail\SellerRejectedMail;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SellerVerificationController extends Controller
{
    public function index()
    {
        $sellers = Seller::whereIn('status', ['pending', 'rejected', 'unverified'])
            ->with('user:id,name,email')
            ->orderBy('updated_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/Verifications/Index', [
            'sellers' => $sellers
        ]);
    }

    public function show(Seller $seller)
    {
        return Inertia::render('Admin/Verifications/Show', [
            'seller' => $seller->load('user')
        ]);
    }

    public function approve(Request $request, Seller $seller)
    {
        $seller->status = 'approved';
        $seller->verified_at = now();
        $seller->rejection_reason = null;
        $seller->save();

        \App\Models\Notification::create([
            'user_id' => $seller->user_id,
            'type'    => 'shop_approved',
            'title'   => 'Shop Approved!',
            'body'    => 'Your shop application for "' . $seller->shop_name . '" has been approved. Welcome to Bloom & Glow!',
            'data'    => [
                'shop_name' => $seller->shop_name
            ],
            'seller_id' => $seller->id,
        ]);

        $seller->user->notify(new \App\Notifications\ShopApplicationApproved());

        return redirect()->route('admin.verifications.index')->with('success', 'Seller approved successfully.');
    }

    public function reject(Request $request, Seller $seller)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000'
        ]);

        $seller->status = 'rejected';
        $seller->rejection_reason = $validated['reason'];
        $seller->save();

        \App\Models\Notification::create([
            'user_id' => $seller->user_id,
            'type'    => 'shop_rejected',
            'title'   => 'Shop Application Rejected',
            'body'    => 'Your shop application for "' . $seller->shop_name . '" has been rejected. Reason: ' . $validated['reason'],
            'data'    => [
                'shop_name' => $seller->shop_name,
                'reason' => $validated['reason']
            ],
            'seller_id' => $seller->id,
        ]);

        $seller->user->notify(new \App\Notifications\ShopApplicationRejected($validated['reason']));

        return redirect()->route('admin.verifications.index')->with('success', 'Seller rejected successfully.');
    }

    public function document($path): StreamedResponse
    {
        // Decode path if needed
        $path = urldecode($path);
        
        if (!Storage::disk('local')->exists($path)) {
            abort(404, 'Document not found.');
        }

        // Secure Audit Logging
        \Illuminate\Support\Facades\Log::info('Secure Document Accessed', [
            'admin_id' => auth()->id(),
            'admin_email' => auth()->user()->email ?? null,
            'document_path' => $path,
            'accessed_at' => now()->toDateTimeString(),
        ]);

        return Storage::disk('local')->response($path);
    }
}
