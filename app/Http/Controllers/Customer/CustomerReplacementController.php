<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\ReplacementRequest;
use App\Models\Order;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CustomerReplacementController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,order_id',
            'reason' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'images' => 'required|array|min:1|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:5120', // 5MB max
        ]);

        $order = Order::where('user_id', auth()->id())
            ->where('order_id', $validated['order_id'])
            ->firstOrFail();

        // Check if eligible
        if (!in_array(strtolower($order->order_status), ['completed', 'delivered'])) {
            return back()->with('error', 'Only delivered orders are eligible for replacement.');
        }
        
        if (ReplacementRequest::where('order_id', $order->order_id)->exists()) {
            return back()->with('error', 'A replacement request has already been submitted for this order.');
        }

        if ($order->replacement_for_order_id) {
            return back()->with('error', 'Cannot request a replacement for an order that is already a replacement.');
        }

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                // Store in public disk under replacements directory
                $path = $image->store('replacements', 'public');
                $imagePaths[] = asset('storage/' . $path);
            }
        }

        ReplacementRequest::create([
            'order_id' => $order->order_id,
            'user_id' => auth()->id(),
            'seller_id' => $order->seller_id,
            'reason' => $validated['reason'],
            'description' => $validated['description'],
            'evidence_images' => $imagePaths,
            'status' => 'Replacement Requested',
        ]);

        Notification::create([
            'user_id' => $order->seller->user_id,
            'type'    => 'replacement_requested',
            'title'   => 'New Replacement Request',
            'body'    => 'Customer ' . auth()->user()->name . ' requested a replacement for order ' . $order->display_order_id . ' due to: ' . $validated['reason'],
            'data'    => ['order_id' => $order->order_id],
            'order_id' => $order->order_id,
            'seller_id' => $order->seller_id,
        ]);

        return back()->with('success', 'Your replacement request has been submitted successfully. The seller will review it shortly.');
    }
}
