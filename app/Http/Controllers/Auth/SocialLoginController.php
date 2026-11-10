<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class SocialLoginController extends Controller
{
    public function redirect(string $provider): RedirectResponse
    {
        if (! in_array($provider, ['google', 'facebook'], true)) {
            return redirect()->route('login')->with('error', 'Unsupported sign-in provider.');
        }

        $redirectUrl = $this->buildRedirectUrl($provider);

        return Socialite::driver($provider)->redirectUrl($redirectUrl)->redirect();
    }

    public function callback(string $provider): RedirectResponse
    {
        if (! in_array($provider, ['google', 'facebook'], true)) {
            return redirect()->route('login')->with('error', 'Unsupported sign-in provider.');
        }

        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (Throwable $e) {
            report($e);

            return redirect()->route('login')->with(
                'error',
                'Unable to sign in with ' . Str::ucfirst($provider) . '. Please try again.'
            );
        }

        $user = User::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if (! $user && $socialUser->getEmail()) {
            $user = User::where('email', $socialUser->getEmail())->first();
        }

        if (! $user) {
            $user = $this->createUser($provider, $socialUser);
        } else {
            $user = $this->updateUser($user, $provider, $socialUser);
        }

        Auth::guard('web')->login($user, true);
        request()->session()->regenerate();

        return redirect()->intended('/');
    }

    protected function createUser(string $provider, mixed $socialUser): User
    {
        $name = $this->resolveDisplayName($socialUser);
        $firstName = trim((string) ($socialUser->user['given_name'] ?? '')) ?: null;
        $lastName = trim((string) ($socialUser->user['family_name'] ?? '')) ?: null;

        return User::create([
            'first_name' => $firstName ?? $name,
            'last_name' => $lastName,
            'name' => $name,
            'email' => $socialUser->getEmail() ?: $this->makeFallbackEmail($provider, $socialUser),
            'password' => Str::random(24),
            'provider' => $provider,
            'provider_id' => $socialUser->getId(),
            'avatar_url' => $socialUser->getAvatar(),
            'email_verified_at' => now(),
            'terms_accepted' => true,
            'role' => 'customer',
        ]);
    }

    protected function updateUser(User $user, string $provider, mixed $socialUser): User
    {
        $user->fill([
            'name' => $this->resolveDisplayName($socialUser),
            'first_name' => trim((string) ($socialUser->user['given_name'] ?? '')) ?: $user->first_name,
            'last_name' => trim((string) ($socialUser->user['family_name'] ?? '')) ?: $user->last_name,
            'provider' => $provider,
            'provider_id' => $socialUser->getId(),
            'avatar_url' => $socialUser->getAvatar() ?? $user->avatar_url,
            'email_verified_at' => $user->email_verified_at ?? now(),
        ]);

        if (! $user->email && $socialUser->getEmail()) {
            $user->email = $socialUser->getEmail();
        }

        $user->save();

        return $user;
    }

    protected function resolveDisplayName(mixed $socialUser): string
    {
        $name = trim((string) $socialUser->getName());

        if ($name === '') {
            $name = trim((string) ($socialUser->user['given_name'] ?? '')) . ' ' . trim((string) ($socialUser->user['family_name'] ?? ''));
        }

        return trim($name) ?: 'Customer';
    }

    protected function makeFallbackEmail(string $provider, mixed $socialUser): string
    {
        $base = Str::slug($this->resolveDisplayName($socialUser));

        return sprintf('%s-%s-%s@gmail.com', $base, $provider, substr(md5((string) $socialUser->getId()), 0, 8));
    }

    protected function buildRedirectUrl(string $provider): string
    {
        $configured = config('services.' . $provider . '.redirect');

        if (! empty($configured)) {
            return $configured;
        }

        $baseUrl = rtrim(url('/'), '/');

        return $baseUrl . '/auth/' . $provider . '/callback';
    }
}
