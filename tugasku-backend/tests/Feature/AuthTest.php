<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_user_and_returns_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Budi Santoso',
            'nim' => '3312201045',
            'email' => 'budi@polibatam.ac.id',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['message', 'access_token', 'token_type', 'user']);

        $this->assertDatabaseHas('users', [
            'nim' => '3312201045',
            'email' => 'budi@polibatam.ac.id',
        ]);

        $this->assertTrue(
            Hash::check('rahasia123', User::where('email', 'budi@polibatam.ac.id')->first()->password)
        );
    }

    public function test_register_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'budi@polibatam.ac.id']);

        $this->postJson('/api/register', [
            'name' => 'Budi Santoso',
            'nim' => '3312201046',
            'email' => 'budi@polibatam.ac.id',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_register_requires_strong_password(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Budi Santoso',
            'nim' => '3312201045',
            'email' => 'budi@polibatam.ac.id',
            'password' => 'short',
            'password_confirmation' => 'short',
        ])->assertStatus(422)->assertJsonValidationErrors('password');
    }

    public function test_login_succeeds_with_nim(): void
    {
        $user = User::factory()->create([
            'nim' => '3312201045',
            'password' => Hash::make('rahasia123'),
        ]);

        $this->postJson('/api/login', [
            'email_or_nim' => '3312201045',
            'password' => 'rahasia123',
        ])->assertOk()->assertJsonStructure(['access_token', 'token_type', 'user']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'budi@polibatam.ac.id',
            'password' => Hash::make('rahasia123'),
        ]);

        $this->postJson('/api/login', [
            'email_or_nim' => 'budi@polibatam.ac.id',
            'password' => 'salahpassword',
        ])->assertStatus(422)->assertJsonValidationErrors('email_or_nim');
    }

    public function test_forgot_password_sends_notification(): void
    {
        Notification::fake();

        $user = User::factory()->create(['email' => 'budi@polibatam.ac.id']);

        $this->postJson('/api/forgot-password', ['email' => 'budi@polibatam.ac.id'])
            ->assertOk()
            ->assertJsonStructure(['message']);

        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    public function test_forgot_password_hides_unknown_email(): void
    {
        Notification::fake();

        $this->postJson('/api/forgot-password', ['email' => 'tidak@ada.com'])
            ->assertOk()
            ->assertJsonStructure(['message']);

        Notification::assertNothingSent();
    }

    public function test_reset_password_updates_password_and_revokes_tokens(): void
    {
        $user = User::factory()->create(['email' => 'budi@polibatam.ac.id']);
        $user->createToken('tugasku-token');

        // Token broker dibuat lewat Password facade, bukan token Sanctum.
        $token = Password::broker()->createToken($user);

        $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'budi@polibatam.ac.id',
            'password' => 'katasandibaru123',
            'password_confirmation' => 'katasandibaru123',
        ])->assertOk()->assertJsonStructure(['message']);

        $user->refresh();

        $this->assertTrue(Hash::check('katasandibaru123', $user->password));
        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_reset_password_rejects_invalid_token(): void
    {
        User::factory()->create(['email' => 'budi@polibatam.ac.id']);

        $this->postJson('/api/reset-password', [
            'token' => 'token-palsu',
            'email' => 'budi@polibatam.ac.id',
            'password' => 'katasandibaru123',
            'password_confirmation' => 'katasandibaru123',
        ])->assertStatus(422)->assertJsonValidationErrors('token');
    }

    public function test_logout_revokes_current_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('tugasku-token')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertSame(0, $user->tokens()->count());
    }
}