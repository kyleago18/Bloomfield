<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Users can only view their own profile.
     * Admins can view any user profile.
     */
    public function view(User $authUser, User $targetUser): bool
    {
        if ($authUser->role === 'super_admin') {
            return true;
        }

        return $authUser->id === $targetUser->id;
    }

    /**
     * Users can only update their own profile.
     * Admins can update any user profile.
     */
    public function update(User $authUser, User $targetUser): bool
    {
        if ($authUser->role === 'super_admin') {
            return true;
        }

        return $authUser->id === $targetUser->id;
    }

    /**
     * Users can only delete their own account.
     * Admins can delete any account.
     */
    public function delete(User $authUser, User $targetUser): bool
    {
        if ($authUser->role === 'super_admin') {
            return true;
        }

        return $authUser->id === $targetUser->id;
    }
}
