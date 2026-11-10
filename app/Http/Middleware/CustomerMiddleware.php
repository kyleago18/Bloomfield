<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CustomerMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Not authenticated at all
        if (!$user) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Unauthenticated.'], 401);
            }
            return redirect()->route('login')->with('error', 'Please log in to continue.');
        }

        // Allow customers, sellers, and vendor_admins to access the storefront/checkout
        if (!in_array($user->role, ['customer', 'vendor_admin', 'seller'])) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Unauthorized. Customer access required.'], 403);
            }

            // Redirect each role to their appropriate area
            return match ($user->role) {
                'super_admin', 'admin' => redirect()->route('admin.dashboard')
                    ->with('error', 'This area is for customers only.'),
                default        => redirect()->route('home')
                    ->with('error', 'Access denied.'),
            };
        }

        return $next($request);
    }
}
