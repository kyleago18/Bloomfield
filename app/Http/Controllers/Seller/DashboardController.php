<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Product;
use App\Models\ReplacementRequest;
use App\Models\SellerFollower;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $seller = auth()->user()->seller;

        if (!$seller) {
            return Inertia::render('Seller/Dashboard', ['seller' => null, 'stats' => []]);
        }

        $sellerId = $seller->id;

        // ── Product Stats (1 query instead of 4) ────────────────────────────────
        $productStats = DB::selectOne("
            SELECT
                SUM(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END)                                    AS total_products,
                SUM(CASE WHEN deleted_at IS NULL AND is_active = true THEN 1 ELSE 0 END)               AS active_products,
                SUM(CASE WHEN deleted_at IS NULL AND stock = 0 THEN 1 ELSE 0 END)                      AS out_of_stock,
                SUM(CASE WHEN deleted_at IS NULL AND stock > 0 AND stock <= 5 THEN 1 ELSE 0 END)       AS low_stock
            FROM products
            WHERE seller_id = ?
        ", [$sellerId]);

        // ── Order Stats + Revenue (1 query instead of 6) ────────────────────────
        $orderStats = DB::selectOne("
            SELECT
                SUM(CASE WHEN order_status = 'Pending' THEN 1 ELSE 0 END)                                          AS pending_orders,
                SUM(CASE WHEN order_status IN ('Accepted','Preparing','Out for Delivery') THEN 1 ELSE 0 END)       AS processing_orders,
                SUM(CASE WHEN order_status IN ('Delivered','Completed') THEN 1 ELSE 0 END)                         AS completed_orders,
                SUM(CASE WHEN order_status = 'Cancelled' THEN 1 ELSE 0 END)                                        AS cancelled_orders,
                COALESCE(SUM(CASE WHEN order_status IN ('Delivered','Completed') THEN total_amount ELSE 0 END), 0)   AS total_revenue,
                COALESCE(SUM(CASE WHEN order_status IN ('Delivered','Completed')
                    AND EXTRACT(MONTH FROM order_date) = EXTRACT(MONTH FROM CURRENT_DATE)
                    AND EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM CURRENT_DATE)
                    THEN total_amount ELSE 0 END
                ), 0) AS monthly_revenue
            FROM orders
            WHERE seller_id = ?
        ", [$sellerId]);

        $chartData = [];

        $selectedMonth = request('month', now()->month);
        $currentYear = now()->year;
        $monthStart = \Carbon\Carbon::createFromDate($currentYear, $selectedMonth, 1)->startOfDay();
        $monthEnd = $monthStart->copy()->endOfMonth();

        $revenueData = Order::where('seller_id', $sellerId)
            ->whereIn('order_status', ['Delivered', 'Completed'])
            ->whereBetween('order_date', [$monthStart, $monthEnd])
            ->select(DB::raw("DATE(order_date) as date"), DB::raw("SUM(total_amount) as revenue"))
            ->groupBy(DB::raw("DATE(order_date)"))
            ->orderBy('date')
            ->get()
            ->map(fn($row) => ['name' => \Carbon\Carbon::parse($row->date)->format('M d'), 'revenue' => (float) $row->revenue]);

        for ($i = 1; $i <= $monthEnd->day; $i++) {
            $date = $monthStart->copy()->addDays($i - 1)->format('M d');
            $found = $revenueData->firstWhere('name', $date);
            $chartData[] = ['name' => $date, 'revenue' => $found ? $found['revenue'] : 0];
        }

        $currentMonthTarget = (float) ($seller->monthly_target ?? 1000000.00);

        $totalOrdersCount = (int) ($orderStats->completed_orders + $orderStats->pending_orders + $orderStats->processing_orders);
        $fulfillmentRatio = $totalOrdersCount > 0 
            ? (int) round(($orderStats->completed_orders / $totalOrdersCount) * 100) 
            : 0;

        // ── Best Selling Products (select only needed columns) ───────────────────
        $bestSellers = Product::where('seller_id', $sellerId)
            ->withCount(['orderItems as total_sold' => fn($q) => $q->select(DB::raw('SUM(quantity)'))])
            ->orderByDesc('total_sold')
            ->take(5)
            ->get(['product_id', 'flower_name', 'name', 'price', 'stock', 'thumbnail']);

        // ── Recent Orders (select only needed columns to reduce payload) ──────────
        $recentOrders = Order::where('seller_id', $sellerId)
            ->with([
                'orderItems' => fn($q) => $q->select(['order_id', 'product_id', 'quantity', 'subtotal'])
                    ->with(['product:product_id,flower_name,name,thumbnail,price']),
                'user:id,name,email',
                'delivery:order_id,delivery_status,street_address,barangay,city,province',
            ])
            ->latest()
            ->take(10)
            ->get(['order_id', 'display_order_id', 'user_id', 'seller_id', 'total_amount', 'order_status', 'delivery_method', 'payment_method', 'payment_status', 'created_at', 'order_date', 'customer_first_name', 'customer_last_name', 'customer_email']);

        // ── Pending Orders (select only needed columns) ───────────────────────────
        $pendingOrdersList = Order::where('seller_id', $sellerId)
            ->where('order_status', 'Pending')
            ->with([
                'orderItems' => fn($q) => $q->select(['order_id', 'product_id', 'quantity', 'subtotal'])
                    ->with(['product:product_id,flower_name,name,thumbnail,price']),
                'user:id,name,email',
                'delivery:order_id,delivery_status,street_address,barangay,city,province',
            ])
            ->latest()
            ->take(5)
            ->get(['order_id', 'display_order_id', 'user_id', 'seller_id', 'total_amount', 'order_status', 'delivery_method', 'payment_method', 'payment_status', 'created_at', 'order_date', 'customer_first_name', 'customer_last_name', 'customer_email']);

        // ── Unread Notifications ──────────────────────────────────────────────────
        $notifications = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->latest()
            ->take(5)
            ->get(['id', 'user_id', 'type', 'title', 'body', 'read_at', 'created_at', 'order_id']);

        // ── Followers Count and Latest 5 Followers ────────────────────────────────
        $totalFollowers = SellerFollower::where('seller_id', $sellerId)->count();
        $recentFollowers = SellerFollower::where('seller_id', $sellerId)
            ->with(['user:id,name,first_name,last_name,avatar_url'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'user_id', 'seller_id', 'created_at']);

        // ── Replacement Requests ──────────────────────────────────────────────────
        $replacementRequests = ReplacementRequest::where('seller_id', $sellerId)
            ->with([
                'user:id,name,email',
                'order' => fn($q) => $q->select(['order_id', 'display_order_id', 'total_amount', 'created_at', 'delivered_at'])
                    ->with(['orderItems' => fn($iq) => $iq->with(['product:product_id,flower_name,name,thumbnail,price'])])
            ])
            ->latest()
            ->get();

        $pendingReplacementsCount = $replacementRequests->where('status', 'Replacement Requested')->count();

        return Inertia::render('Seller/Dashboard', [
            'seller' => $seller,
            'stats'  => [
                'total_products'    => (int) $productStats->total_products,
                'active_products'   => (int) $productStats->active_products,
                'out_of_stock'      => (int) $productStats->out_of_stock,
                'low_stock'         => (int) $productStats->low_stock,
                'pending_orders'    => (int) $orderStats->pending_orders,
                'processing_orders' => (int) $orderStats->processing_orders,
                'completed_orders'  => (int) $orderStats->completed_orders,
                'cancelled_orders'  => (int) $orderStats->cancelled_orders,
                'total_revenue'     => (float) $orderStats->total_revenue,
                'monthly_revenue'   => (float) $orderStats->monthly_revenue,
                'monthly_target'    => (float) $currentMonthTarget,
                'fulfillment_ratio' => $fulfillmentRatio,
                'total_followers'   => (int) $totalFollowers,
                'pending_replacements' => $pendingReplacementsCount,
            ],
            'revenue_data'        => $chartData,
            'best_sellers'        => $bestSellers,
            'recent_orders'       => $recentOrders,
            'pending_orders_list' => $pendingOrdersList,
            'notifications'       => $notifications,
            'recent_followers'    => $recentFollowers,
            'replacement_requests' => $replacementRequests,
        ]);
    }

    public function updateTarget(\Illuminate\Http\Request $request): \Illuminate\Http\RedirectResponse
    {
        $seller = auth()->user()->seller;
        if (!$seller) {
            return back()->with('error', 'Seller profile not found.');
        }

        $validated = $request->validate([
            'monthly_target' => 'required|numeric|min:0',
        ]);

        $seller->update([
            'monthly_target' => $validated['monthly_target'],
        ]);

        return back()->with('success', 'Monthly sales goal updated successfully!');
    }
}
