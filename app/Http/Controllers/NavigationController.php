<?php

namespace App\Http\Controllers;

use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NavigationController extends Controller
{
    /**
     * Live navigation page to a flower shop.
     * Accepts seller_id and/or lat & lng query params.
     */
    public function show(Request $request)
    {
        $user        = $request->user();
        $destination = null;
        $shopName    = 'Flower shop';
        $error       = null;

        $sellerId = $request->query('seller_id');
        $lat      = $request->query('lat');
        $lng      = $request->query('lng');
        $orderId  = $request->query('order_id') ? (int) $request->query('order_id') : null;

        // Ownership validation: if an order_id is provided, ensure the user owns or sold this order
        if ($orderId) {
            $order = DB::table('orders')->where('order_id', $orderId)->first();
            if ($order) {
                $isCustomer = $user->role === 'customer' && (int) $order->user_id === $user->id;
                $isSeller   = $user->role === 'vendor_admin' && $user->seller && (int) $order->seller_id === $user->seller->id;
                $isAdmin    = $user->role === 'super_admin';

                if (!$isCustomer && !$isSeller && !$isAdmin) {
                    abort(403, 'You are not authorized to navigate to this order.');
                }
            }
        }

        if ($sellerId) {
            $seller = Seller::query()
                ->select(['id', 'latitude', 'longitude', 'shop_name'])
                ->find($sellerId);
            if ($seller && $this->isValidCoordinate($seller->latitude, $seller->longitude)) {
                $destination = [
                    'lat' => (float) $seller->latitude,
                    'lng' => (float) $seller->longitude,
                ];
                $shopName = $seller->shop_name ?: $shopName;
            } else {
                $error = 'This flower shop does not have a valid map location yet.';
            }
        } elseif ($lat !== null && $lng !== null && $this->isValidCoordinate($lat, $lng)) {
            $destination = [
                'lat' => (float) $lat,
                'lng' => (float) $lng,
            ];
            $shopName = $request->query('shop_name', $shopName);
        } else {
            $error = 'No destination provided. Open navigation from checkout or an order.';
        }

        return Inertia::render('Navigate', [
            'destination' => $destination,
            'shopName'    => $shopName,
            'sellerId'    => $sellerId ? (int) $sellerId : null,
            'error'       => $error,
        ]);
    }

    /**
     * Resolve shop coordinates for a completed order (success page).
     */
    public function destinationForOrder($orderOrId): array
    {
        if (!$orderOrId) {
            return ['destination' => null, 'shopName' => null, 'sellerId' => null];
        }

        $seller = null;
        $sellerId = null;

        if ($orderOrId instanceof \App\Models\Order) {
            $sellerId = $orderOrId->seller_id;
            $seller = $orderOrId->relationLoaded('seller') ? $orderOrId->seller : null;
        } else {
            $order = DB::table('orders')->where('order_id', (int) $orderOrId)->first();
            $sellerId = $order?->seller_id;
        }

        if (!$sellerId) {
            return ['destination' => null, 'shopName' => null, 'sellerId' => null];
        }

        if (!$seller) {
            $seller = Seller::query()
                ->select(['id', 'latitude', 'longitude', 'shop_name'])
                ->find($sellerId);
        }

        if (!$seller || !$this->isValidCoordinate($seller->latitude, $seller->longitude)) {
            return [
                'destination' => null,
                'shopName' => $seller?->shop_name,
                'sellerId' => $sellerId,
            ];
        }

        return [
            'destination' => [
                'lat' => (float) $seller->latitude,
                'lng' => (float) $seller->longitude,
            ],
            'shopName' => $seller->shop_name,
            'sellerId' => $seller->id,
        ];
    }

    private function isValidCoordinate($lat, $lng): bool
    {
        if ($lat === null || $lng === null || $lat === '' || $lng === '') {
            return false;
        }

        $lat = (float) $lat;
        $lng = (float) $lng;

        return $lat >= -90 && $lat <= 90
            && $lng >= -180 && $lng <= 180
            && !($lat == 0.0 && $lng == 0.0);
    }
}
