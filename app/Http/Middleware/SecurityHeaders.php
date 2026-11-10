<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * SecurityHeaders middleware
 *
 * Appends standard security headers to every HTTP response.
 * CSP is intentionally permissive to support Inertia.js + Vite hot-reload
 * in development while still blocking the most common XSS vectors.
 *
 * For a stricter CSP in production, tighten the script-src nonce directive
 * after enabling HTTPS and disabling Vite HMR.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $isProduction = app()->environment('production');

        // Prevent MIME-type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Deny framing from other origins (clickjacking protection)
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // Control referrer information sent to third parties
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Restrict browser feature access
        $response->headers->set(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=(self), payment=(self)'
        );

        // HTTP Strict Transport Security — only set in production over HTTPS.
        // In local dev this would break plain HTTP.
        if ($isProduction) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains'
            );
        }

        // Content-Security-Policy is only applied in production.
        // In development, Vite HMR uses IPv6 loopback (http://[::1]:5173) which
        // has inconsistent CSP support across browsers — skip it entirely in dev.
        if ($isProduction) {
            $cspDirectives = [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com https://accounts.google.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "font-src 'self' https://fonts.gstatic.com data:",
                "img-src 'self' data: blob: https:",
                "connect-src 'self' https://api.stripe.com wss:",
                "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://maps.googleapis.com",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
            ];
            $response->headers->set('Content-Security-Policy', implode('; ', $cspDirectives));
        }

        return $response;
    }
}
