<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function view(?User $user, Product $product): bool
    {
        return true; // Public products are viewable by anyone
    }

    public function create(User $user): bool
    {
        $isSeller = in_array($user->role, ['vendor_admin', 'seller']) || ($user->role === 'customer' && $user->seller && $user->seller->isApproved());
        return $isSeller && $user->seller !== null;
    }

    public function update(User $user, Product $product): bool
    {
        if ($user->role === 'super_admin') return true;
        $isSeller = in_array($user->role, ['vendor_admin', 'seller']) || ($user->role === 'customer' && $user->seller && $user->seller->isApproved());
        return $isSeller 
            && $user->seller 
            && $user->seller->id === $product->seller_id;
    }

    public function delete(User $user, Product $product): bool
    {
        if ($user->role === 'super_admin') return true;
        $isSeller = in_array($user->role, ['vendor_admin', 'seller']) || ($user->role === 'customer' && $user->seller && $user->seller->isApproved());
        return $isSeller 
            && $user->seller 
            && $user->seller->id === $product->seller_id;
    }

    public function restore(User $user, Product $product): bool
    {
        return $this->delete($user, $product);
    }
}
