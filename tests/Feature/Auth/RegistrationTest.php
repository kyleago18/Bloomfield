<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@gmail.com',
            'mobile_number' => '09171234567',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@gmail.com',
            'name' => 'Test User',
        ]);
        $this->assertTrue(User::where('email', 'test@gmail.com')->exists());
        $this->assertGuest();
        $response->assertRedirect(route('login', absolute: false));
    }

    public function test_new_users_can_register_with_gender_and_date_of_birth(): void
    {
        $response = $this->post('/register', [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'gender' => 'Female',
            'date_of_birth' => '1995-05-15',
            'email' => 'jane@gmail.com',
            'mobile_number' => '09171234568',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'jane@gmail.com',
            'gender' => 'Female',
        ]);
        $user = User::where('email', 'jane@gmail.com')->first();
        $this->assertNotNull($user->date_of_birth);
        $this->assertEquals('1995-05-15', $user->date_of_birth->format('Y-m-d'));
        $response->assertRedirect(route('login', absolute: false));
    }

    public function test_registration_fails_with_future_date_of_birth(): void
    {
        $futureDate = date('Y-m-d', strtotime('+1 year'));

        $response = $this->post('/register', [
            'first_name' => 'Future',
            'last_name' => 'User',
            'gender' => 'Male',
            'date_of_birth' => $futureDate,
            'email' => 'future@gmail.com',
            'mobile_number' => '09171234569',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertSessionHasErrors(['date_of_birth']);
    }
}
