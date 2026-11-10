<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSellerIsApproved
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->seller) {
            return redirect()->route('seller.register');
        }

        $seller = $user->seller;

        if ($seller->isPending()) {
            return redirect()->route('seller.verification.pending');
        }

        if ($seller->isUnverified() || $seller->isRejected()) {
            return redirect()->route('seller.verification');
        }

        return $next($request);
    }
}
