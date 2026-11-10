<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Notifications\SendOtpEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        $user = $request->user();

        // Generate new 6-digit OTP
        $otpCode = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Cache for 10 minutes
        Cache::put('email_otp_' . $user->id, $otpCode, now()->addMinutes(10));

        // Log OTP for local development ease
        \Illuminate\Support\Facades\Log::info("Verification OTP resent for User {$user->id} ({$user->email}): {$otpCode}");

        // Send OTP via email
        try {
            $user->notify(new SendOtpEmail($otpCode));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Failed to send OTP email to {$user->email}: " . $e->getMessage());
            if (!app()->environment('local')) {
                throw $e;
            }
        }

        return back()->with('status', 'verification-link-sent');
    }
}
