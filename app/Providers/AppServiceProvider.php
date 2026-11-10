<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        \App\Models\Review::observe(\App\Observers\ReviewObserver::class);
        \App\Models\OrderItem::observe(\App\Observers\OrderItemObserver::class);
        \App\Models\Product::observe(\App\Observers\ProductObserver::class);

        // ── Named Rate Limiters ──────────────────────────────────────────────
        // All limits are configurable via .env variables.
        // File-cache backed for development; switch CACHE_STORE=redis in production
        // for accurate counters under concurrent load.

        // Login: 5 attempts/min per username+IP combo (brute-force protection)
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(
                (int) env('RATE_LIMIT_LOGIN', 5)
            )->by($request->input('username') . '|' . $request->ip());
        });

        // Registration: 5 accounts/min per IP (prevents mass account creation)
        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(
                (int) env('RATE_LIMIT_REGISTER', 5)
            )->by($request->ip());
        });

        // Password reset: 5 requests/min per IP (prevents email flooding)
        RateLimiter::for('password-reset', function (Request $request) {
            return Limit::perMinute(
                (int) env('RATE_LIMIT_PASSWORD_RESET', 5)
            )->by($request->ip());
        });

        // Search: 60 requests/min per IP (generous for normal browsing)
        RateLimiter::for('search', function (Request $request) {
            return Limit::perMinute(
                (int) env('RATE_LIMIT_SEARCH', 60)
            )->by($request->ip());
        });

        // Cart: 30 mutations/min per authenticated user or IP (guest carts)
        RateLimiter::for('api-cart', function (Request $request) {
            return Limit::perMinute(
                (int) env('RATE_LIMIT_CART', 30)
            )->by($request->user()?->id ?? $request->ip());
        });

        // Checkout: 10 orders/min per authenticated user (prevents order spam)
        RateLimiter::for('checkout', function (Request $request) {
            return Limit::perMinute(
                (int) env('RATE_LIMIT_CHECKOUT', 10)
            )->by($request->user()?->id ?? $request->ip());
        });

        // General API: 120 requests/min (default fallback for unlisted routes)
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(
                (int) env('RATE_LIMIT_API', 120)
            )->by($request->user()?->id ?? $request->ip());
        });



        // Reviews: 10 submissions/min (aggressive anti-spam for review bombing)
        RateLimiter::for('reviews', function (Request $request) {
            return Limit::perMinute(
                (int) env('RATE_LIMIT_REVIEWS', 10)
            )->by($request->user()?->id ?? $request->ip());
        });
    }
}
