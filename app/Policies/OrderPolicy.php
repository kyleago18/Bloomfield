<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        if ($user->role === 'super_admin') return true;
        $isSeller = $user->role === 'vendor_admin' || ($user->role === 'customer' && $user->seller && $user->seller->isApproved());
        if ($isSeller && $user->seller) {
            return $order->seller_id === $user->seller->id;
        }
        return $order->user_id === $user->id;
    }

    public function update(User $user, Order $order): bool
    {
        if ($user->role === 'super_admin') return true;
        $isSeller = $user->role === 'vendor_admin' || ($user->role === 'customer' && $user->seller && $user->seller->isApproved());
        if ($isSeller && $user->seller) {
            return $order->seller_id === $user->seller->id;
        }
        return false;
    }
}
