<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $seller = auth()->user()->seller;

        $query = Order::where('seller_id', $seller->id)
            ->with([
                'orderItems.product:product_id,flower_name,name,thumbnail,price',
                'user:id,name,email,avatar_url',
                'delivery',
                'payment',
            ]);

        if ($request->filled('status')) {
            $query->where('order_status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn($q) => $q
                ->where('display_order_id', 'like', "%{$search}%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhere('customer_email', 'like', "%{$search}%")
                ->orWhere('customer_first_name', 'like', "%{$search}%")
                ->orWhere('customer_last_name', 'like', "%{$search}%")
            );
        }

        $orders = $query->latest()->paginate(20)->withQueryString();

        $metricsRaw = DB::selectOne("
            SELECT
                COUNT(*) AS total_orders,
                SUM(CASE WHEN order_status = 'Pending' THEN 1 ELSE 0 END) AS pending_orders,
                COALESCE(SUM(CASE WHEN order_status IN ('Delivered', 'Completed') THEN total_amount ELSE 0 END), 0) AS total_revenue
            FROM orders
            WHERE seller_id = ?
        ", [$seller->id]);

        $metrics = [
            'total_orders'   => (int) ($metricsRaw->total_orders ?? 0),
            'pending_orders' => (int) ($metricsRaw->pending_orders ?? 0),
            'total_revenue'  => (float) ($metricsRaw->total_revenue ?? 0),
        ];

        return Inertia::render('Seller/Orders/Index', [
            'orders'  => $orders,
            'seller'  => $seller,
            'filters' => $request->only(['status', 'search']),
            'metrics' => $metrics,
        ]);
    }

    public function show(Order $order): Response
    {
        $seller = auth()->user()->seller;

        if ($order->seller_id !== $seller->id) {
            abort(403, 'You are not authorized to view this order.');
        }

        $order->load(['orderItems.product', 'user.addresses', 'delivery', 'payment']);

        return Inertia::render('Seller/Orders/Show', [
            'order'  => $order,
            'seller' => $seller,
        ]);
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $seller = auth()->user()->seller;

        if ($order->seller_id !== $seller->id) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'status' => 'required|in:Pending,Confirmed,Preparing,Ready for Pickup,Out for Delivery,Delivered,Cancelled',
        ]);

        $oldStatus = $order->order_status;
        $newStatus = $validated['status'];

        $order->update([
            'order_status' => $newStatus,
            'delivered_at' => $newStatus === 'Delivered' ? now() : $order->delivered_at,
        ]);

        OrderStatusHistory::create([
            'order_id' => $order->order_id,
            'status' => $newStatus,
            'changed_by' => auth()->id(),
        ]);

        // Inventory management
        $activeStatuses = ['Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered'];
        $inactiveStatuses = ['Pending', 'Cancelled'];

        if (in_array($oldStatus, ['Pending']) && in_array($newStatus, $activeStatuses)) {
            // Deduct stock
            foreach ($order->orderItems as $item) {
                if ($item->product) {
                    $item->product->decrement('stock', $item->quantity);
                }
            }
        } elseif (in_array($oldStatus, $activeStatuses) && in_array($newStatus, ['Cancelled'])) {
            // Refund stock
            foreach ($order->orderItems as $item) {
                if ($item->product) {
                    $item->product->increment('stock', $item->quantity);
                }
            }
        }

        // Update delivery status if delivery exists
        if ($order->delivery) {
            $order->delivery->update(['delivery_status' => $newStatus]);
        }

        $displayCode = $order->display_order_id ?: $order->order_id;

        // Notify customer
        $statusTitles = [
            'Confirmed' => 'Order Confirmed',
            'Preparing' => 'Order in Preparation',
            'Ready for Pickup' => 'Order Ready for Pickup',
            'Out for Delivery' => 'Order Out for Delivery',
            'Delivered' => 'Order Delivered',
            'Cancelled' => 'Order Cancelled',
        ];

        $statusBodies = [
            'Confirmed' => 'Your order ' . $displayCode . ' has been confirmed by ' . $seller->shop_name . '.',
            'Preparing' => 'The florist at ' . $seller->shop_name . ' is preparing your fresh arrangement for order ' . $displayCode . '.',
            'Ready for Pickup' => 'Your order ' . $displayCode . ' is ready for pickup at ' . $seller->shop_name . '.',
            'Out for Delivery' => 'Your fresh blooms from ' . $seller->shop_name . ' are out for delivery for order ' . $displayCode . '.',
            'Delivered' => 'Your bouquet from ' . $seller->shop_name . ' has been successfully delivered! (Order ' . $displayCode . ')',
            'Cancelled' => 'Your order ' . $displayCode . ' was cancelled by ' . $seller->shop_name . '.',
        ];

        $title = $statusTitles[$newStatus] ?? ('Order ' . $displayCode . ' Updated');
        $body = $statusBodies[$newStatus] ?? ('Your order status has been updated to: ' . $newStatus);

        Notification::create([
            'user_id' => $order->user_id,
            'type'    => 'order_status_updated',
            'title'   => $title,
            'body'    => $body,
            'data'    => [
                'order_id' => $order->order_id,
                'display_order_id' => $displayCode,
                'status' => $newStatus,
                'shop_name' => $seller->shop_name
            ],
            'order_id' => $order->order_id,
            'seller_id' => $seller->id,
        ]);

        // Auto-update payment to paid when Delivered
        if ($newStatus === 'Delivered' && $order->payment_status !== 'paid') {
            $order->update(['payment_status' => 'paid', 'paid_at' => now()]);
        }

        return back()->with('success', 'Order status updated to ' . $newStatus . '.');
    }

    public function updatePaymentStatus(Request $request, Order $order): RedirectResponse
    {
        $seller = auth()->user()->seller;

        if ($order->seller_id !== $seller->id) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'payment_status' => 'required|in:pending,paid,failed,refunded',
        ]);

        $order->update([
            'payment_status' => $validated['payment_status'],
            'paid_at' => $validated['payment_status'] === 'paid' ? now() : null,
        ]);

        // Notify customer
        $displayCode = $order->display_order_id ?: $order->order_id;
        $paymentStatusText = strtoupper($validated['payment_status']);
        Notification::create([
            'user_id' => $order->user_id,
            'type'    => 'payment_status_updated',
            'title'   => 'PAID' === $paymentStatusText ? 'Payment Confirmed' : 'Payment Status Updated',
            'body'    => 'Your payment of ₱' . number_format($order->total_amount, 2) . ' for order ' . $displayCode . ' has been marked as ' . $paymentStatusText . '.',
            'data'    => [
                'order_id' => $order->order_id,
                'display_order_id' => $displayCode,
                'payment_status' => $validated['payment_status'],
                'amount' => $order->total_amount
            ],
            'order_id' => $order->order_id,
            'seller_id' => $seller->id,
        ]);

        return back()->with('success', 'Payment status marked as ' . $validated['payment_status'] . '.');
    }
}
