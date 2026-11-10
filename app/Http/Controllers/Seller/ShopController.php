<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function edit(): Response
    {
        $seller = auth()->user()->seller;
        $seller->load(['follows.user', 'followers.user'])->loadCount(['followers', 'follows']);

        return Inertia::render('Seller/Shop/Edit', [
            'seller' => $seller,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $seller = auth()->user()->seller;

        $validated = $request->validate([
            'shop_name'       => 'required|string|max:255',
            'owner_name'      => 'required|string|max:255',
            'email'           => 'required|email|max:255',
            'phone_number'    => 'nullable|string|max:20',
            'shop_description'=> 'nullable|string|max:2000',
            'address'         => 'nullable|string|max:500',
            'barangay'        => 'nullable|string|max:255',
            'city'            => 'nullable|string|max:255',
            'province'        => 'nullable|string|max:255',
            'postal_code'     => 'nullable|string|max:20',
            'latitude'        => 'nullable|numeric',
            'longitude'       => 'nullable|numeric',
            'shop_logo'       => 'nullable|image|max:2048',
            'shop_banner'     => 'nullable|image|max:5120',
        ]);

        // Handle logo upload
        if ($request->hasFile('shop_logo')) {
            if ($seller->shop_logo) {
                Storage::disk('public')->delete($seller->shop_logo);
            }
            $validated['shop_logo'] = $request->file('shop_logo')->store('sellers/logos', 'public');
        } else {
            unset($validated['shop_logo']);
        }

        // Handle banner upload
        if ($request->hasFile('shop_banner')) {
            if ($seller->shop_banner) {
                Storage::disk('public')->delete($seller->shop_banner);
            }
            $validated['shop_banner'] = $request->file('shop_banner')->store('sellers/banners', 'public');
        } else {
            unset($validated['shop_banner']);
        }

        $seller->update($validated);

        return back()->with('success', 'Shop profile updated successfully.');
    }

    public function updateImage(Request $request)
    {
        $seller = auth()->user()->seller;

        $request->validate([
            'shop_logo'   => 'nullable|image|max:2048',
            'shop_banner' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('shop_logo')) {
            if ($seller->shop_logo) {
                Storage::disk('public')->delete($seller->shop_logo);
            }
            $seller->shop_logo = $request->file('shop_logo')->store('sellers/logos', 'public');
        }

        if ($request->hasFile('shop_banner')) {
            if ($seller->shop_banner) {
                Storage::disk('public')->delete($seller->shop_banner);
            }
            $seller->shop_banner = $request->file('shop_banner')->store('sellers/banners', 'public');
        }

        $seller->save();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'message' => 'Image updated successfully.']);
        }
        
        return back()->with('success', 'Image updated successfully.');
    }
}
