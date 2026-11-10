<?php

use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\SellerManagementController;
use App\Http\Controllers\NavigationController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\Seller\AuthController as SellerAuthController;
use App\Http\Controllers\Seller\CustomerController as SellerCustomerController;
use App\Http\Controllers\Seller\DashboardController as SellerDashboardController;
use App\Http\Controllers\Seller\FollowerController as SellerFollowerController;
use App\Http\Controllers\Seller\OrderController as SellerOrderController;
use App\Http\Controllers\Seller\ProductController as SellerProductController;
use App\Http\Controllers\Seller\VerificationController as SellerVerificationController;
use App\Http\Controllers\Seller\SellerReplacementController;
use App\Http\Controllers\Seller\ShopController as SellerShopController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\UserAddressController;

use App\Http\Controllers\Auth\SocialController;
use App\Http\Controllers\Customer\CustomerReplacementController;
use App\Http\Controllers\Api\CartController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use App\Models\Category;

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC STORE
// ══════════════════════════════════════════════════════════════════════════════

Route::get('/', function () {
    $fetchProducts = function () {
        return \App\Models\Product::with([
                'seller:id,shop_name,city,province,status,shop_logo,is_verified',
                'category:id,name,slug'
            ])
            ->active()
            ->where('is_addon', false)
            ->whereNull('deleted_at')
            ->select(['product_id', 'seller_id', 'category_id', 'name', 'flower_name', 'description', 'price', 'discount_price', 'stock', 'thumbnail', 'is_active', 'is_featured', 'is_flash_sale', 'delivery_available', 'pickup_available', 'reviews_count', 'average_rating', 'sales_count', 'created_at'])
            ->latest()
            ->get()
            ->append(['display_name', 'effective_price', 'thumbnail_url'])
            ->toArray();
    };

    $fetchCategories = function () {
        return Category::where('is_active', true)->orderBy('sort_order')->get()->toArray();
    };

    $products = app()->environment('local') 
        ? $fetchProducts() 
        : Cache::remember('homepage_products', 1800, $fetchProducts);

    $categories = app()->environment('local')
        ? $fetchCategories()
        : Cache::rememberForever('active_categories', $fetchCategories);

    return Inertia::render('Welcome', [
        'canLogin'    => Route::has('login'),
        'canRegister' => Route::has('register'),
        'products'    => $products,
        'categories'  => $categories,
    ]);
})->name('home');

// Seller landing page
Route::get('/sell', [PageController::class, 'sellLanding'])->name('sell.landing');

// Search
Route::get('/search', [SearchController::class, 'index'])->name('search')->middleware('throttle:search');
Route::get('/api/products/search', [SearchController::class, 'searchApi'])->name('api.products.search')->middleware('throttle:search');

// Cart API — 30 req/min per authenticated user or IP
Route::middleware('throttle:api-cart')->group(function () {
    Route::get('/api/cart', [CartController::class, 'index'])->name('api.cart.index');
    Route::post('/api/cart', [CartController::class, 'store'])->name('api.cart.store');
    Route::put('/api/cart/{productId}', [CartController::class, 'update'])->name('api.cart.update');
    Route::delete('/api/cart/clear', [CartController::class, 'clear'])->name('api.cart.clear');
    Route::delete('/api/cart/{productId}', [CartController::class, 'destroy'])->name('api.cart.destroy');
});

// Product detail
Route::get('/products/{id}', [ProductController::class, 'show'])->name('products.show');

// Seller storefront
Route::get('/shop/{id}', [ShopController::class, 'show'])->name('shop.show');

// Follow seller (auth required)
Route::post('/shop/{id}/follow', [ShopController::class, 'toggleFollow'])
    ->middleware('auth')
    ->name('shop.follow');

// ══════════════════════════════════════════════════════════════════════════════
// SELLER AUTH (Guest only)
// ══════════════════════════════════════════════════════════════════════════════

Route::get('/seller/register', [SellerAuthController::class, 'showRegister'])->name('seller.register');
Route::post('/seller/register', [SellerAuthController::class, 'register']);

Route::middleware('guest')->group(function () {
    Route::get('/seller/login', [SellerAuthController::class, 'showLogin'])->name('seller.login');
    Route::post('/seller/login', [SellerAuthController::class, 'login']);
});

Route::post('/seller/logout', [SellerAuthController::class, 'logout'])
    ->middleware('auth')
    ->name('seller.logout');

// ══════════════════════════════════════════════════════════════════════════════
// SELLER PORTAL (auth + seller middleware)
// ══════════════════════════════════════════════════════════════════════════════

Route::middleware(['auth', 'seller'])->prefix('seller')->name('seller.')->group(function () {
    // Verification routes (bypass seller.approved middleware)
    Route::get('/verification', [\App\Http\Controllers\Seller\VerificationController::class, 'index'])->name('verification');
    Route::post('/verification', [\App\Http\Controllers\Seller\VerificationController::class, 'store'])->name('verification.store');
    Route::get('/verification/pending', [\App\Http\Controllers\Seller\VerificationController::class, 'pending'])->name('verification.pending');

    // Operational routes guarded by seller.approved
    Route::middleware(['seller.approved'])->group(function () {
        Route::get('/dashboard', [SellerDashboardController::class, 'index'])->name('dashboard');
        Route::patch('/dashboard/target', [SellerDashboardController::class, 'updateTarget'])->name('dashboard.update-target');

    // Shop profile
    Route::get('/shop', [SellerShopController::class, 'edit'])->name('shop.edit');
    Route::post('/shop', [SellerShopController::class, 'update'])->name('shop.update');
    Route::post('/shop/image', [SellerShopController::class, 'updateImage'])->name('shop.update-image');

    // Products
    Route::get('/products', [SellerProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [SellerProductController::class, 'create'])->name('products.create');
    Route::post('/products', [SellerProductController::class, 'store'])->name('products.store');
    Route::get('/products/{product}/edit', [SellerProductController::class, 'edit'])->name('products.edit');
    Route::post('/products/{product}', [SellerProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [SellerProductController::class, 'destroy'])->name('products.destroy');


    // Followers
    Route::get('/followers', [SellerFollowerController::class, 'index'])->name('followers.index');

    Route::post('/products/{id}/restore', [SellerProductController::class, 'restore'])->name('products.restore');
    Route::patch('/products/{product}/toggle-active', [SellerProductController::class, 'toggleActive'])->name('products.toggle');
    Route::patch('/products/{product}/stock', [SellerProductController::class, 'updateStock'])->name('products.update-stock');
    Route::post('/products/{product}/duplicate', [SellerProductController::class, 'duplicate'])->name('products.duplicate');

    // Replacements
    Route::get('/replacements', [SellerReplacementController::class, 'index'])->name('replacements.index');
    Route::post('/replacements/{id}/approve', [SellerReplacementController::class, 'approve'])->name('replacements.approve');
    Route::post('/replacements/{id}/reject', [SellerReplacementController::class, 'reject'])->name('replacements.reject');

    // Orders
    Route::get('/orders', [SellerOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [SellerOrderController::class, 'show'])->name('orders.show');
    Route::patch('/orders/{order}/status', [SellerOrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::patch('/orders/{order}/payment-status', [SellerOrderController::class, 'updatePaymentStatus'])->name('orders.update-payment-status');

    // Followers
    Route::get('/followers', [SellerFollowerController::class, 'index'])->name('followers.index');

    // Customers
    Route::get('/customers/{user}', [SellerCustomerController::class, 'show'])->name('customers.show');
    }); // End of seller.approved group
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN (auth + admin middleware)
// ══════════════════════════════════════════════════════════════════════════════

// Dispatcher for generic /dashboard requests (fallback for Breeze and Middleware redirects)
Route::get('/dashboard', function () {
    $role = auth()->user()->role ?? 'customer';
    if (in_array($role, ['admin', 'super_admin'])) {
        return redirect()->route('admin.dashboard');
    } elseif (in_array($role, ['vendor_admin', 'seller'])) {
        return redirect()->route('seller.dashboard');
    }
    return redirect()->route('home');
})->middleware('auth')->name('dashboard');

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN (auth + admin middleware)
// ══════════════════════════════════════════════════════════════════════════════

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::patch('/sellers/{seller}', [DashboardController::class, 'updateSellerStatus'])->name('sellers.update');


    // KYC Verification Management
    Route::get('/verifications', [\App\Http\Controllers\Admin\SellerVerificationController::class, 'index'])->name('verifications.index');
    Route::get('/verifications/{seller}', [\App\Http\Controllers\Admin\SellerVerificationController::class, 'show'])->name('verifications.show');
    Route::post('/verifications/{seller}/approve', [\App\Http\Controllers\Admin\SellerVerificationController::class, 'approve'])->name('verifications.approve');
    Route::post('/verifications/{seller}/reject', [\App\Http\Controllers\Admin\SellerVerificationController::class, 'reject'])->name('verifications.reject');
    Route::get('/verifications/document/{path}', [\App\Http\Controllers\Admin\SellerVerificationController::class, 'document'])->name('verifications.document')->where('path', '.*');

    // Users management
    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
    Route::patch('/users/{user}/status', [\App\Http\Controllers\Admin\UserController::class, 'updateStatus'])->name('users.status');

    // Seller management
    Route::get('/sellers', [SellerManagementController::class, 'index'])->name('sellers.index');
    Route::patch('/sellers/{seller}/status', [SellerManagementController::class, 'updateStatus'])->name('sellers.status');

    // Shop Reports
    Route::get('/reports', [\App\Http\Controllers\Admin\ShopReportController::class, 'index'])->name('reports.index');
    Route::patch('/reports/{report}/status', [\App\Http\Controllers\Admin\ShopReportController::class, 'updateStatus'])->name('reports.status');
});

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOMER AUTHENTICATED
// ══════════════════════════════════════════════════════════════════════════════

Route::middleware(['auth', 'customer'])->group(function () {
    // Checkout — 10 requests/min per authenticated user
    Route::get('/checkout', function () {
        $lastOrder = \App\Models\Order::where('user_id', auth()->id())
            ->latest('created_at')
            ->first();
            
        $lastDelivery = null;
        if ($lastOrder) {
            $lastDelivery = \App\Models\Delivery::where('order_id', $lastOrder->order_id)->first();
        }

        $userAddresses = \App\Models\UserAddress::where('user_id', auth()->id())->get();

        return Inertia::render('Checkout', [
            'lastOrder' => $lastOrder,
            'lastDelivery' => $lastDelivery,
            'userAddresses' => $userAddresses,
        ]);
    })->name('checkout');

    Route::post('/checkout', [OrderController::class, 'store'])->name('checkout.store')->middleware('throttle:checkout');
    Route::post('/checkout/create-session', [PaymentController::class, 'createCheckoutSession'])->name('checkout.create-session')->middleware('throttle:checkout');

    // Addresses
    Route::post('/account/addresses', [UserAddressController::class, 'store'])->name('addresses.store');
    Route::put('/account/addresses/{address}', [UserAddressController::class, 'update'])->name('addresses.update');
    Route::delete('/account/addresses/{address}', [UserAddressController::class, 'destroy'])->name('addresses.destroy');


    // Orders
    Route::get('/orders', [\App\Http\Controllers\Customer\OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [\App\Http\Controllers\Customer\OrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/cancel', [\App\Http\Controllers\Customer\OrderController::class, 'cancel'])->name('orders.cancel');
    Route::delete('/orders/{order}/hide', [\App\Http\Controllers\Customer\OrderController::class, 'hide'])->name('orders.hide');
    Route::post('/orders/{order}/receive', [\App\Http\Controllers\Customer\OrderController::class, 'receive'])->name('orders.receive');

    // Reviews — 10 per minute (anti-spam)
    Route::post('/products/{productId}/reviews', [ReviewController::class, 'store'])->name('reviews.store')->middleware('throttle:reviews');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Customer Replacement Requests
    Route::post('/replacements', [CustomerReplacementController::class, 'store'])->name('customer.replacement.store');
    
    // Shop Reports
    Route::post('/shop/{sellerId}/report', [\App\Http\Controllers\ShopReportController::class, 'store'])->name('shop.report.store');
});

// Notifications (General Auth API)
Route::middleware('auth')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::delete('/notifications/all', [NotificationController::class, 'destroyAll'])->name('notifications.delete-all');
    Route::delete('/notifications/selected', [NotificationController::class, 'destroySelected'])->name('notifications.delete-selected');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
});

// Seller review reply
Route::middleware(['auth', 'seller'])->group(function () {
    Route::post('/reviews/{review}/reply', [ReviewController::class, 'sellerReply'])->name('reviews.reply');
});

// ══════════════════════════════════════════════════════════════════════════════
// NAVIGATION & DELIVERY MAP
// ══════════════════════════════════════════════════════════════════════════════

Route::middleware('auth')->get('/navigate', [NavigationController::class, 'show'])->name('navigate');

// ══════════════════════════════════════════════════════════════════════════════
// CHECKOUT FLOW
// ══════════════════════════════════════════════════════════════════════════════

Route::middleware('auth')->get('/checkout/success', function (\Illuminate\Http\Request $request) {
    $user            = $request->user();
    $orderId         = $request->query('order_id') ? (int) $request->query('order_id') : null;
    $paymentIntentId = $request->query('payment_intent');
    $sessionId       = $request->query('session_id');
    $order           = null;

    // ── Handle Stripe Checkout Session redirect ──
    if ($sessionId) {
        $orderService = app(\App\Services\OrderService::class);
        $existingOrderId = $orderService->orderExistsForCheckoutSession($sessionId);

        if (!$existingOrderId) {
            // Create the order from the Checkout Session
            try {
                \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
                $session = \Stripe\Checkout\Session::retrieve($sessionId);

                if ($session->payment_status === 'paid') {
                    $validated = \Illuminate\Support\Facades\Cache::get('pending_checkout:' . $sessionId);

                    if ($validated) {
                        \Illuminate\Support\Facades\DB::beginTransaction();
                        try {
                            // Resolve payment method label
                            $paymentLabel = 'Online Payment (Stripe)';
                            if (isset($session->payment_intent) && is_string($session->payment_intent)) {
                                try {
                                    $pi = \Stripe\PaymentIntent::retrieve($session->payment_intent);
                                    if (isset($pi->payment_method) && is_string($pi->payment_method)) {
                                        $pm = \Stripe\PaymentMethod::retrieve($pi->payment_method);
                                        $type = $pm->type ?? 'card';
                                        if ($type === 'card' && isset($pm->card->wallet->type)) {
                                            $type = $pm->card->wallet->type;
                                        }
                                        $paymentLabel = match ($type) {
                                            'card' => 'Credit/Debit Card',
                                            'apple_pay' => 'Apple Pay',
                                            'google_pay' => 'Google Pay',
                                            'link' => 'Link by Stripe',
                                            default => ucwords(str_replace('_', ' ', $type)),
                                        };
                                    }
                                } catch (\Throwable $e) {
                                    \Illuminate\Support\Facades\Log::warning('Could not resolve payment method: ' . $e->getMessage());
                                }
                            }

                            $existingOrderId = $orderService->createOrder(
                                $validated,
                                $paymentLabel,
                                'Paid',
                                [
                                    'payment_intent_id' => $session->payment_intent,
                                    'payment_status' => $session->payment_status,
                                    'amount_paid' => round($session->amount_total / 100, 2),
                                    'paid_at' => now(),
                                    'checkout_session_id' => $session->id,
                                ]
                            );

                            \Illuminate\Support\Facades\DB::commit();
                            \Illuminate\Support\Facades\Cache::forget('pending_checkout:' . $sessionId);
                        } catch (\Throwable $e) {
                            \Illuminate\Support\Facades\DB::rollBack();
                            \Illuminate\Support\Facades\Log::error('Order creation from Checkout Session failed: ' . $e->getMessage());
                        }
                    }
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Stripe Session retrieval failed: ' . $e->getMessage());
            }
        }

        $orderId = $existingOrderId;
    }

    if ($orderId) {
        $order = \App\Models\Order::with(['orderItems.product', 'seller', 'delivery', 'payment'])->find($orderId);
    } elseif ($paymentIntentId) {
        $order   = \App\Models\Order::with(['orderItems.product', 'seller', 'delivery', 'payment'])->where('stripe_payment_intent_id', $paymentIntentId)->first();
        $orderId = $order ? (int) $order->order_id : null;
    }

    // Ownership check: only the customer who placed the order may view this page
    if ($order && $user->role === 'customer' && (int) $order->user_id !== $user->id) {
        abort(403, 'You are not authorized to view this order.');
    }

    $nav = app(NavigationController::class)->destinationForOrder($order ?? $orderId);

    return Inertia::render('CheckoutSuccess', [
        'order'         => $order,
        'orderId'       => $order?->display_order_id ?? ($order ? (string) $order->order_id : null),
        'rawOrderId'    => $order?->order_id,
        'paymentMethod' => $order?->payment_method ?? null,
        'paymentStatus' => $order?->payment_status ?? null,
        'destination'   => $nav['destination'],
        'shopName'      => $order?->seller?->shop_name ?? $nav['shopName'],
        'sellerId'      => $nav['sellerId'],
    ]);
})->name('checkout.success');

Route::get('/checkout/cancel', function () {
    return Inertia::render('CheckoutCancel');
})->name('checkout.cancel');

Route::post('/stripe/webhook', [PaymentController::class, 'webhook'])->name('stripe.webhook');

// ══════════════════════════════════════════════════════════════════════════════
// GOOGLE AUTH
// ══════════════════════════════════════════════════════════════════════════════

// Customer Google Auth
Route::get('/auth/google', [SocialController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [SocialController::class, 'handleGoogleCallback'])->name('auth.google.callback');

// Seller Google Auth
Route::get('/seller/auth/google', [SocialController::class, 'redirectToGoogleAsSeller'])->name('seller.auth.google');
Route::get('/seller/auth/google/callback', [SocialController::class, 'handleGoogleCallbackSeller'])->name('seller.auth.google.callback');


require __DIR__.'/auth.php';
