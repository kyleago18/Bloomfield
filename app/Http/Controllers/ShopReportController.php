<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ShopReportController extends Controller
{
    public function store(Request $request, $sellerId)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        \App\Models\ShopReport::create([
            'user_id' => auth()->id(),
            'seller_id' => $sellerId,
            'reason' => $validated['reason'],
            'description' => $validated['description'],
            'status' => 'pending',
        ]);

        return back()->with('success', 'Thank you for your report. Our team will review this shop shortly.');
    }
}
