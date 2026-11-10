<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Notifications\SendOtpEmail;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'error' => session('error'),
        ]);
    }

    public function store(RegisterRequest $request): RedirectResponse
    {
        $firstName = trim((string) $request->first_name);
        $lastName = trim((string) $request->last_name);
        $displayName = $firstName . ' ' . $lastName;

        try {
            $user = DB::transaction(function () use ($request, $displayName, $firstName, $lastName): User {
                $user = User::create([
                    'name' => $displayName,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'gender' => $request->gender,
                    'date_of_birth' => $request->date_of_birth,
                    'username' => $request->username,
                    'email' => $request->email,
                    'mobile_number' => $request->mobile_number,
                    'password' => $request->password,
                    'email_verified_at' => null, // Require verification
                    'terms_accepted' => true,
                    'role' => 'customer',
                ]);

                return $user;
            });
        } catch (\Throwable $e) {
            report($e);

            return back()->withInput()->withErrors([
                'email' => 'We could not create your account. Please check your database connection and try again.',
            ]);
        }

        event(new Registered($user));

        Auth::login($user);

        // Generate 6-digit OTP
        $otpCode = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Cache for 10 minutes
        Cache::put('email_otp_' . $user->id, $otpCode, now()->addMinutes(10));

        // Log OTP for local development ease
        \Illuminate\Support\Facades\Log::info("Verification OTP generated for User {$user->id} ({$user->email}): {$otpCode}");

        // Send OTP via email
        try {
            $user->notify(new SendOtpEmail($otpCode));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Failed to send OTP email to {$user->email}: " . $e->getMessage());
            // In non-local environment, we still throw it to inform the user/system
            if (!app()->environment('local')) {
                throw $e;
            }
        }

        return redirect()->route('verification.notice');
    }
}

