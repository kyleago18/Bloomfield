<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\SellerFollower;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FollowerController extends Controller
{
    public function index(Request $request): Response
    {
        $seller = auth()->user()->seller;

        if (!$seller) {
            abort(403, 'Seller profile not found.');
        }

        $query = SellerFollower::where('seller_id', $seller->id)
            ->with(['user' => function ($q) {
                $q->select('id', 'name', 'first_name', 'last_name', 'email', 'avatar_url', 'created_at');
            }]);

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $followers = $query->latest('created_at')->paginate(20)->withQueryString();

        $totalFollowers = SellerFollower::where('seller_id', $seller->id)->count();

        return Inertia::render('Seller/Followers/Index', [
            'seller'         => $seller,
            'followers'      => $followers,
            'filters'        => $request->only(['search']),
            'totalFollowers' => $totalFollowers,
        ]);
    }
}
