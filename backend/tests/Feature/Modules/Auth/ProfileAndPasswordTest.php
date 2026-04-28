<?php

use App\Models\Auth\Role;
use App\Models\Auth\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->role = Role::firstOrCreate(['name' => 'Staff', 'description' => 'Staff role']);
    $this->user = User::factory()->create([
        'email' => 'staff@qollab.com',
        'password' => Hash::make('current-pass-1'),
        'role_id' => $this->role->id,
        'is_active' => true,
    ]);
});

test('GET /api/user returns the exact UserResource shape the frontend expects', function () {
    $this->actingAs($this->user);

    $response = $this->getJson('/api/user');

    $response->assertOk()
        ->assertJsonStructure([
            'id',
            'email',
            'full_name',
            'is_active',
            'last_login_at',
            'role' => ['id', 'name', 'description'],
            'created_at',
            'updated_at',
        ])
        ->assertJsonMissing(['password'])
        ->assertJsonMissing(['remember_token']);

    expect($response->json('role.name'))->toBe('Staff');
    expect($response->json('email'))->toBe('staff@qollab.com');
});

test('authenticated user can update their own profile', function () {
    $this->actingAs($this->user);

    $response = $this->putJson('/api/user/profile', [
        'full_name' => 'Updated Name',
        'email' => 'updated@qollab.com',
    ]);

    $response->assertOk()
        ->assertJsonPath('full_name', 'Updated Name')
        ->assertJsonPath('email', 'updated@qollab.com');

    expect($this->user->fresh()->email)->toBe('updated@qollab.com');
});

test('profile update rejects an email already taken by another user', function () {
    User::factory()->create([
        'email' => 'taken@qollab.com',
        'role_id' => $this->role->id,
    ]);

    $this->actingAs($this->user);

    $this->putJson('/api/user/profile', [
        'full_name' => 'Whoever',
        'email' => 'taken@qollab.com',
    ])->assertStatus(422)->assertJsonValidationErrors(['email']);
});

test('profile update is rejected when unauthenticated', function () {
    $this->putJson('/api/user/profile', [
        'full_name' => 'X',
        'email' => 'x@qollab.com',
    ])->assertStatus(401);
});

test('user can change their password with the correct current password', function () {
    $this->actingAs($this->user);

    $response = $this->putJson('/api/user/password', [
        'current_password' => 'current-pass-1',
        'password' => 'new-strong-pass-2',
        'password_confirmation' => 'new-strong-pass-2',
    ]);

    $response->assertOk()->assertJsonPath('status', 'password-updated');

    expect(Hash::check('new-strong-pass-2', $this->user->fresh()->password))->toBeTrue();
});

test('password change is rejected when current password is wrong', function () {
    $this->actingAs($this->user);

    $this->putJson('/api/user/password', [
        'current_password' => 'wrong',
        'password' => 'new-strong-pass-2',
        'password_confirmation' => 'new-strong-pass-2',
    ])->assertStatus(422)->assertJsonValidationErrors(['current_password']);
});

test('password change is rejected when confirmation does not match', function () {
    $this->actingAs($this->user);

    $this->putJson('/api/user/password', [
        'current_password' => 'current-pass-1',
        'password' => 'new-strong-pass-2',
        'password_confirmation' => 'different',
    ])->assertStatus(422)->assertJsonValidationErrors(['password']);
});

test('password change is rejected when unauthenticated', function () {
    $this->putJson('/api/user/password', [
        'current_password' => 'current-pass-1',
        'password' => 'new-strong-pass-2',
        'password_confirmation' => 'new-strong-pass-2',
    ])->assertStatus(401);
});
