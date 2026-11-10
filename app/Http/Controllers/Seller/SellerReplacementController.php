<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\ReplacementRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SellerReplacementController extends Controller
{
    public function index()
    {
        $seller = auth()->user()->seller;

        $requests = ReplacementRequest::with([
            'order.orderItems.product',
            'user:id,name,email',
            'replacementOrder'
        ])
        ->where('seller_id', $seller->id)
        ->latest()
        ->get();

        return Inertia::render('Seller/Replacements', [
            'requests' => $requests,
            'seller' => $seller
        ]);
    }

    public function approve($id)
    {
        $seller = auth()->user()->seller;
        
        $request = ReplacementRequest::with(['order.orderItems.product'])
            ->where('seller_id', $seller->id)
            ->findOrFail($id);

        if ($request->status !== 'Replacement Requested') {
            return back()->with('error', 'This request has already been processed.');
        }

        DB::beginTransaction();
        try {
            // Create a replacement order ($0 total)
            $originalOrder = $request->order;
            
            $replacementOrder = Order::create([
                'user_id' => $originalOrder->user_id,
                'seller_id' => $seller->id,
                'order_status' => 'Preparing',
                'total_amount' => 0, // Free replacement
                'shipping_fee' => 0, // Free shipping
                'tax_amount' => 0,
                'payment_method' => 'replacement',
                'payment_status' => 'Paid',
                'customer_first_name' => $originalOrder->customer_first_name,
                'customer_last_name' => $originalOrder->customer_last_name,
                'customer_contact' => $originalOrder->customer_contact,
                'customer_email' => $originalOrder->customer_email,
                'receiver_first_name' => $originalOrder->receiver_first_name,
                'receiver_last_name' => $originalOrder->receiver_last_name,
                'receiver_contact' => $originalOrder->receiver_contact,
                'receiver_email' => $originalOrder->receiver_email,
                'delivery_method' => $originalOrder->delivery_method,
                'schedule_date' => $originalOrder->schedule_date,
                'schedule_time' => $originalOrder->schedule_time,
                'address_id' => $originalOrder->address_id,
                'delivery_latitude' => $originalOrder->delivery_latitude,
                'delivery_longitude' => $originalOrder->delivery_longitude,
                'special_instructions' => 'Replacement for order #' . $originalOrder->display_order_id,
                'display_order_id' => strtoupper(Str::random(6)),
                'replacement_for_order_id' => $originalOrder->order_id,
            ]);

            // Duplicate order items but with $0 price
            foreach ($originalOrder->orderItems as $item) {
                OrderItem::create([
                    'order_id' => $replacementOrder->order_id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => 0,
                    'subtotal' => 0,
                ]);
            }

            // Update request status
            $request->update([
                'status' => 'Replacement Approved',
                'replacement_order_id' => $replacementOrder->order_id,
            ]);

            Notification::create([
                'user_id' => $originalOrder->user_id,
                'type'    => 'replacement_approved',
                'title'   => 'Replacement Approved',
                'body'    => 'Your replacement request for order ' . $originalOrder->display_order_id . ' has been approved. A new order has been created.',
                'data'    => ['order_id' => $replacementOrder->order_id],
                'order_id' => $originalOrder->order_id,
                'seller_id' => $seller->id,
            ]);

            DB::commit();
            return back()->with('success', 'Replacement request approved and replacement order created.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'An error occurred while creating the replacement order: ' . $e->getMessage());
        }
    }

    public function reject(Request $req, $id)
    {
        $seller = auth()->user()->seller;
        
        $request = ReplacementRequest::where('seller_id', $seller->id)
            ->findOrFail($id);

        if ($request->status !== 'Replacement Requested') {
            return back()->with('error', 'This request has already been processed.');
        }

        $validated = $req->validate([
            'rejection_reason' => 'required|string|max:500'
        ]);

        $request->update([
            'status' => 'Replacement Rejected',
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        Notification::create([
            'user_id' => $request->order->user_id,
            'type'    => 'replacement_rejected',
            'title'   => 'Replacement Rejected',
            'body'    => 'Your replacement request for order ' . $request->order->display_order_id . ' has been rejected. Reason: ' . $validated['rejection_reason'],
            'data'    => ['order_id' => $request->order_id],
            'order_id' => $request->order_id,
            'seller_id' => $seller->id,
        ]);

        return back()->with('success', 'Replacement request rejected.');
    }
}
