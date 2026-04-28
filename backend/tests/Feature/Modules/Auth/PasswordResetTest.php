<?php

use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Notifications\Auth\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->role = Role::firstOrCreate(['name' => 'Staff', 'description' => 'Staff role']);
    $this->user = User::factory()->create([
        'email' => 'reset-me@qollab.test',
        'password' => Hash::make('old-password-1'),
        'role_id' => $this->role->id,
        'is_active' => true,
    ]);
});

test('forgot-password sends a reset link for a known email', function () {
    Notification::fake();

    $this->postJson('/api/password/forgot', ['email' => $this->user->email])
        ->assertOk()
        ->assertJsonPath('status', 'password-reset-link-sent');

    Notification::assertSentTo($this->user, ResetPasswordNotification::class);
});

test('forgot-password returns the same response for an unknown email (no enumeration)', function () {
    Notification::fake();

    $this->postJson('/api/password/forgot', ['email' => 'nobody@qollab.test'])
        ->assertOk()
        ->assertJsonPath('status', 'password-reset-link-sent');

    Notification::assertNothingSent();
});

test('forgot-password validates the email field', function () {
    $this->postJson('/api/password/forgot', ['email' => 'not-an-email'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('reset-password sets a new password with a valid token', function () {
    $token = Password::createToken($this->user);

    $this->postJson('/api/password/reset', [
        'token' => $token,
        'email' => $this->user->email,
        'password' => 'brand-new-pass-9',
        'password_confirmation' => 'brand-new-pass-9',
    ])
        ->assertOk()
        ->assertJsonPath('status', 'password-reset');

    expect(Hash::check('brand-new-pass-9', $this->user->fresh()->password))->toBeTrue();
});

test('reset-password rejects an invalid token', function () {
    $this->postJson('/api/password/reset', [
        'token' => 'totally-bogus-token',
        'email' => $this->user->email,
        'password' => 'brand-new-pass-9',
        'password_confirmation' => 'brand-new-pass-9',
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('reset-password rejects an unknown email even with a token-shaped string', function () {
    $this->postJson('/api/password/reset', [
        'token' => 'whatever',
        'email' => 'nobody@qollab.test',
        'password' => 'brand-new-pass-9',
        'password_confirmation' => 'brand-new-pass-9',
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('reset-password requires password confirmation to match', function () {
    $token = Password::createToken($this->user);

    $this->postJson('/api/password/reset', [
        'token' => $token,
        'email' => $this->user->email,
        'password' => 'brand-new-pass-9',
        'password_confirmation' => 'mismatch',
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['password']);
});

test('user can log in with the new password after reset', function () {
    $token = Password::createToken($this->user);

    $this->postJson('/api/password/reset', [
        'token' => $token,
        'email' => $this->user->email,
        'password' => 'brand-new-pass-9',
        'password_confirmation' => 'brand-new-pass-9',
    ])->assertOk();

    $this->withHeaders(['referer' => 'http://localhost:3000'])
        ->postJson('/api/login', [
            'email' => $this->user->email,
            'password' => 'brand-new-pass-9',
        ])
        ->assertOk();
});
