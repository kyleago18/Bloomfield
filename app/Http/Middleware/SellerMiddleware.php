<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SellerMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Not authenticated at all
        if (!$user) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Unauthenticated.'], 401);
            }
            return redirect()->route('seller.login')->with('error', 'Please log in to your seller account to continue.');
        }

        // Authenticated but not a seller (vendor_admin, seller, or customer with a seller profile)
        $isVendorAdmin = in_array($user->role, ['vendor_admin', 'seller']);
        $hasSellerProfile = $user->role === 'customer' && $user->seller !== null;

        if (!$isVendorAdmin && !$hasSellerProfile) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Unauthorized. Seller access required.'], 403);
            }

            // Redirect each role to their appropriate area
            return match ($user->role) {
                'super_admin', 'admin' => redirect()->route('admin.dashboard')
                    ->with('error', 'This area is for sellers only.'),
                'customer'    => redirect()->route('profile.edit')
                    ->with('error', 'This area is for sellers only. Redirected to your customer profile.'),
                default       => redirect()->route('home')
                    ->with('error', 'Access denied.'),
            };
        }

        // Authenticated seller but no shop profile
        if (!$user->seller) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'No shop found for your account.'], 403);
            }
            return redirect()->route('seller.login')
                ->with('error', 'No shop found for your account. Please register a shop first.');
        }

        return $next($request);
    }
}
