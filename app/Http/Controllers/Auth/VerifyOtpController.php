<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class VerifyOtpController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();
        $cachedOtp = Cache::get('email_otp_' . $user->id);

        // Allow '123456' as master bypass OTP in local dev environment
        $isLocalMaster = app()->environment('local') && $request->otp === '123456';

        if (!$isLocalMaster) {
            if (!$cachedOtp) {
                return back()->withErrors(['otp' => 'The verification code has expired. Please request a new one.']);
            }

            if ($request->otp !== $cachedOtp) {
                return back()->withErrors(['otp' => 'The verification code is incorrect.']);
            }
        }

        // Code is correct, verify the email
        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        // Clear the cache
        Cache::forget('email_otp_' . $user->id);

        return redirect()->route('home');
    }
}
