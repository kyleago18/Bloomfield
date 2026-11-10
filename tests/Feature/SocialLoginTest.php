<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class SocialLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_new_user_for_a_social_provider(): void
    {
        $socialUser = new SocialiteUser();
        $socialUser->id = 'google-123';
        $socialUser->name = 'Jane Doe';
        $socialUser->email = 'jane@gmail.com';
        $socialUser->avatar = 'https://example.com/avatar.jpg';
        $socialUser->user = [
            'given_name' => 'Jane',
            'family_name' => 'Doe',
        ];

        $provider = Mockery::mock();
        $provider->shouldReceive('stateless')->once()->andReturnSelf();
        $provider->shouldReceive('user')->once()->andReturn($socialUser);

        Socialite::shouldReceive('driver')->with('google')->once()->andReturn($provider);

        $response = $this->get('/auth/google/callback');

        $response->assertRedirect('/');

        $this->assertDatabaseHas('users', [
            'email' => 'jane@gmail.com',
            'google_id' => 'google-123',
            'avatar_url' => 'https://example.com/avatar.jpg',
        ]);

        $this->assertAuthenticated();
    }



    public function test_it_redirects_back_to_login_when_social_login_fails(): void
    {
        $provider = Mockery::mock();
        $provider->shouldReceive('stateless')->once()->andReturnSelf();
        $provider->shouldReceive('user')->once()->andThrow(new \RuntimeException('Provider denied'));

        Socialite::shouldReceive('driver')->with('google')->once()->andReturn($provider);

        $response = $this->get('/auth/google/callback');

        $response->assertRedirect('/login');
        $response->assertSessionHas('error', 'Google sign-in failed. Please try again.');
    }
}
