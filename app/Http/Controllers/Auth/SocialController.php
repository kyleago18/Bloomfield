<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialController extends Controller
{
    // ── Customer Google Login ───────────────────────────────────────────────────

    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                $user->update(['google_id' => $googleUser->getId()]);
            } else {
                $user = User::create([
                    'name'              => $googleUser->getName() ?? $googleUser->getNickname(),
                    'email'             => $googleUser->getEmail(),
                    'google_id'         => $googleUser->getId(),
                    'avatar_url'        => $googleUser->getAvatar(),
                    'terms_accepted'    => true,
                    'password'          => bcrypt(Str::random(16)),
                    'email_verified_at' => now(),
                    'role'              => 'customer',
                ]);
            }

            Auth::login($user, true);
            request()->session()->regenerate();

            return redirect('/');

        } catch (\Exception $e) {
            Log::error('Google Customer Auth Failed: ' . $e->getMessage());
            return redirect()->route('login')->with('error', 'Google sign-in failed. Please try again.');
        }
    }

    // ── Seller Google Login ─────────────────────────────────────────────────────

    public function redirectToGoogleAsSeller()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallbackSeller()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                if ($user->role === 'customer') {
                    return redirect()->route('login')
                        ->with('error', 'That email is registered as a customer. Please use customer login.');
                }

                // Existing seller — refresh google_id and log in
                $user->update(['google_id' => $googleUser->getId()]);

            } else {
                // Brand-new user signing up as seller via Google
                $user = DB::transaction(function () use ($googleUser): User {
                    $newUser = User::create([
                        'name'              => $googleUser->getName() ?? $googleUser->getNickname(),
                        'email'             => $googleUser->getEmail(),
                        'google_id'         => $googleUser->getId(),
                        'avatar_url'        => $googleUser->getAvatar(),
                        'terms_accepted'    => true,
                        'password'          => bcrypt(Str::random(16)),
                        'email_verified_at' => now(),
                        'role'              => 'vendor_admin',
                    ]);

                    // Create a shell seller record — they complete profile in shop settings
                    Seller::create([
                        'user_id'     => $newUser->id,
                        'shop_name'   => ($googleUser->getName() ?? 'New') . "'s Shop",
                        'owner_name'  => $googleUser->getName() ?? '',
                        'email'       => $googleUser->getEmail(),
                        'status'      => 'pending',
                        'is_verified' => false,
                    ]);

                    return $newUser;
                });
            }

            Auth::login($user, true);
            request()->session()->regenerate();

            return redirect('/');

        } catch (\Exception $e) {
            Log::error('Google Seller Auth Failed: ' . $e->getMessage());
            return redirect()->route('seller.login')->with('error', 'Google sign-in failed. Please try again.');
        }
    }
}
