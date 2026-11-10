<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\ThrottleRequestsException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        // ── Trusted Proxies ──────────────────────────────────────────────────
        // Reads real client IP from X-Forwarded-For when behind Cloudflare/nginx.
        // In production, replace '*' with specific proxy CIDR ranges.
        $middleware->trustProxies(
            at: env('TRUSTED_PROXIES', '*'),
            headers: Request::HEADER_X_FORWARDED_FOR |
                     Request::HEADER_X_FORWARDED_HOST |
                     Request::HEADER_X_FORWARDED_PORT |
                     Request::HEADER_X_FORWARDED_PROTO
        );

        // ── Global Web Middleware ────────────────────────────────────────────
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\SecurityHeaders::class,
            \App\Http\Middleware\LogRateLimitViolations::class,
            \App\Http\Middleware\EnsureUserIsActive::class,
        ]);

        // ── CSRF Exclusions ──────────────────────────────────────────────────
        $middleware->validateCsrfTokens(except: [
            'stripe/webhook',
        ]);

        // ── Route Middleware Aliases ─────────────────────────────────────────
        $middleware->alias([
            'seller'          => \App\Http\Middleware\SellerMiddleware::class,
            'seller.approved' => \App\Http\Middleware\EnsureSellerIsApproved::class,
            'admin'           => \App\Http\Middleware\AdminMiddleware::class,
            'customer'        => \App\Http\Middleware\CustomerMiddleware::class,
        ]);

        // NOTE: Named rate limiters (login, search, checkout, etc.) are registered
        // in AppServiceProvider::boot() — that is the correct Laravel lifecycle
        // stage for facades like RateLimiter::for().
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Return clean JSON for API/Inertia requests — never expose internals
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->expectsJson() || $request->is('api/*'),
        );

        // Clean, branded 429 response — never exposes stack traces or internals
        $exceptions->render(function (ThrottleRequestsException $e, Request $request) {
            $retryAfter = $e->getHeaders()['Retry-After'] ?? 60;

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'error'       => 'Too many requests. Please slow down.',
                    'retry_after' => (int) $retryAfter,
                ], 429, [
                    'Retry-After'       => $retryAfter,
                    'X-RateLimit-Reset' => now()->addSeconds((int) $retryAfter)->timestamp,
                ]);
            }

            // Friendly branded 429 page for browser requests
            return response()->view('errors.429', [
                'retryAfter' => $retryAfter,
            ], 429)->withHeaders([
                'Retry-After' => $retryAfter,
            ]);
        });
    })->create();
