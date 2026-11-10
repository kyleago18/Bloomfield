<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * LogRateLimitViolations middleware
 *
 * Logs HTTP 429 (Too Many Requests) responses for security monitoring.
 * Deliberately logs ONLY: IP, route name, and timestamp.
 * NEVER logs: passwords, tokens, session IDs, payment data, or request bodies.
 *
 * Uses a composite cache key to suppress duplicate log entries from the
 * same IP+route pair within a 60-second window — preventing log flooding.
 */
class LogRateLimitViolations
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        if ($response->getStatusCode() === Response::HTTP_TOO_MANY_REQUESTS) {
            $ip        = $request->ip();
            $route     = $request->route()?->getName() ?? $request->path();
            $method    = $request->method();

            // Suppress duplicate log spam: only log once per 60 seconds per IP+route
            $suppressKey = 'rate_limit_logged:' . md5($ip . $route);
            if (! cache()->has($suppressKey)) {
                Log::warning('Rate limit exceeded', [
                    'ip'        => $ip,
                    'method'    => $method,
                    'route'     => $route,
                    'timestamp' => now()->toIso8601String(),
                ]);
                // Suppress duplicate log entries for 60 seconds
                cache()->put($suppressKey, 1, 60);
            }
        }

        return $response;
    }
}
