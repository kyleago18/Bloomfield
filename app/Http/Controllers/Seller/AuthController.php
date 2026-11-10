<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    // ── Register ───────────────────────────────────────────────────────────────

    public function showRegister(Request $request): Response
    {
        return Inertia::render('Seller/Auth/Register', [
            'isAuth' => Auth::check(),
            'user' => $request->user(),
        ]);
    }

    public function register(Request $request): RedirectResponse
    {
        $isAuth = Auth::check();

        $rules = [
            'shop_name'    => 'required|string|max:255',
            'owner_name'   => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'address'      => 'nullable|string|max:500',
            'barangay'     => 'nullable|string|max:255',
            'city'         => 'nullable|string|max:255',
            'province'     => 'nullable|string|max:255',
            'postal_code'  => 'nullable|string|max:20',
        ];

        if (!$isAuth) {
            $rules['email'] = 'required|email|unique:users,email';
            $rules['password'] = ['required', 'confirmed', Password::min(8)];
        }

        $validated = $request->validate($rules);

        try {
            $user = DB::transaction(function () use ($validated, $isAuth, $request): User {
                if ($isAuth) {
                    $user = $request->user();
                    // Do NOT update role to vendor_admin, keep it as customer.
                    $email = $user->email;
                } else {
                    $user = User::create([
                        'name'             => $validated['owner_name'],
                        'email'            => $validated['email'],
                        'password'         => Hash::make($validated['password']),
                        'role'             => 'customer',
                        'email_verified_at'=> now(),
                        'terms_accepted'   => true,
                    ]);
                    $email = $validated['email'];
                }

                Seller::create([
                    'user_id'      => $user->id,
                    'shop_name'    => $validated['shop_name'],
                    'owner_name'   => $validated['owner_name'],
                    'email'        => $email,
                    'phone_number' => $validated['phone_number'] ?? null,
                    'address'      => $validated['address'] ?? null,
                    'barangay'     => $validated['barangay'] ?? null,
                    'city'         => $validated['city'] ?? null,
                    'province'     => $validated['province'] ?? null,
                    'postal_code'  => $validated['postal_code'] ?? null,
                    'latitude'     => 6.7580, // Default to Digos City
                    'longitude'    => 125.3340, // Default to Digos City
                    'status'       => 'unverified',
                    'is_verified'  => false,
                ]);

                return $user;
            });
        } catch (\Throwable $e) {
            report($e);
            return back()->withInput()->withErrors([
                'email' => 'Registration failed. Please try again.',
            ]);
        }

        if (!$isAuth) {
            Auth::login($user);
            $request->session()->regenerate();
        }

        return redirect()->route('seller.verification');
    }

    // ── Login ──────────────────────────────────────────────────────────────────

    public function showLogin(): Response
    {
        return Inertia::render('Auth/Login', [
            'initialRole' => 'seller',
            'canResetPassword' => true,
        ]);
    }

    public function login(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])
            ->where(function($query) {
                $query->where('role', 'vendor_admin')
                      ->orWhereHas('seller');
            })
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return back()->withErrors([
                'email' => 'These credentials do not match a seller account.',
            ])->onlyInput('email');
        }

        if ($user->isSuspended() || ($user->seller && $user->seller->isSuspended())) {
            return back()->withErrors([
                'email' => 'Your account has been suspended. Please contact support.',
            ])->onlyInput('email');
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        return redirect()->intended(route('seller.dashboard'));
    }

    // ── Logout ─────────────────────────────────────────────────────────────────

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('seller.login');
    }
}
