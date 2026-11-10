<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = $request->user()->orders()
            ->with(['seller', 'orderItems.product', 'delivery'])
            ->orderBy('created_at', 'desc')
            ->get();

        $metrics = [
            'total' => $orders->count(),
            'pending' => $orders->where('order_status', 'Pending')->count(),
            'processing' => $orders->whereIn('order_status', ['Confirmed', 'Preparing', 'Ready for Pickup'])->count(),
            'out_for_delivery' => $orders->where('order_status', 'Out for Delivery')->count(),
            'delivered' => $orders->where('order_status', 'Delivered')->count(),
            'cancelled' => $orders->where('order_status', 'Cancelled')->count(),
        ];

        return Inertia::render('Customer/Orders', [
            'orders' => $orders,
            'metrics' => $metrics,
        ]);
    }

    public function show(Request $request, Order $order)
    {
        // Ensure the order belongs to the authenticated user
        if ($order->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $order->load(['seller', 'orderItems.product', 'delivery', 'payment', 'statusHistories']);

        return Inertia::render('Customer/OrderTracker', [
            'order' => $order,
        ]);
    }

    public function cancel(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $cancellableStatuses = ['pending', 'pending_payment', 'placed', 'preparing', 'confirmed'];
        if (!in_array(strtolower($order->order_status), $cancellableStatuses)) {
            return back()->with('error', 'This order cannot be cancelled at this stage.');
        }

        if (strtolower($order->payment_status) === 'paid') {
            return back()->with('error', 'This order cannot be cancelled because it has already been paid online.');
        }

        $order->update(['order_status' => 'Cancelled']);

        \App\Models\OrderStatusHistory::create([
            'order_id' => $order->order_id,
            'status' => 'Cancelled',
            'changed_by' => auth()->id(),
        ]);

        if ($order->seller_id) {
            $displayCode = $order->display_order_id ?: $order->order_id;
            \App\Models\Notification::create([
                'user_id' => $order->seller->user_id, // assuming seller model has user_id
                'type'    => 'order_cancelled_by_customer',
                'title'   => 'Order Cancelled',
                'body'    => 'The customer has cancelled order ' . $displayCode . '.',
                'data'    => [
                    'order_id' => $order->order_id,
                    'display_order_id' => $displayCode,
                ],
                'order_id' => $order->order_id,
                'seller_id' => $order->seller_id,
            ]);
        }

        return back()->with('success', 'Order cancelled successfully.');
    }

    public function hide(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $hideableStatuses = ['completed', 'delivered', 'cancelled'];
        if (!in_array(strtolower($order->order_status), $hideableStatuses)) {
            return back()->with('error', 'Only completed or cancelled orders can be deleted from your view.');
        }

        $order->update(['deleted_by_buyer' => true]);

        return back()->with('success', 'Order removed from your purchase history.');
    }

    public function receive(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $receivableStatuses = ['to_receive', 'out_for_delivery', 'in_transit', 'ready_for_pickup'];
        if (!in_array(strtolower($order->order_status), $receivableStatuses)) {
            return back()->with('error', 'You cannot mark this order as received yet.');
        }

        $order->update([
            'order_status' => 'Completed',
            'delivered_at' => now()
        ]);

        return back()->with('success', 'Order marked as received!');
    }
}
