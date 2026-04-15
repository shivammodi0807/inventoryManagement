<?php

use App\Models\Auth\User;
use App\Models\Auth\Role;
use Illuminate\Support\Facades\Hash;
use function Pest\Laravel\postJson;
use function Pest\Laravel\getJson;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Basic setup needed for User model to work properly (roles)
    $this->role = Role::firstOrCreate(['name' => 'admin', 'description' => 'Admin role']);
    $this->user = User::factory()->create([
        'email' => 'test@qollab.com',
        'password' => Hash::make('password123'),
        'role_id' => $this->role->id,
        'is_active' => true,
    ]);
});

test('can retrieve csrf cookie', function () {
    $response = $this->get('/sanctum/csrf-cookie');
    $response->assertStatus(204);
});

test('can login with valid credentials', function () {
    $response = $this->withHeaders(['referer' => 'http://localhost:3000'])->postJson('/api/login', [
        'email' => 'test@qollab.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
             ->assertJsonStructure(['id', 'email', 'full_name', 'role']);
    
    $this->assertAuthenticatedAs($this->user);
});

test('cannot login with invalid credentials', function () {
    $response = $this->withHeaders(['referer' => 'http://localhost:3000'])->postJson('/api/login', [
        'email' => 'test@qollab.com',
        'password' => 'wrongpassword',
    ]);

    $response->assertStatus(422)
             ->assertJsonValidationErrors(['email']);

    $this->assertGuest();
});

test('inactive user cannot login', function () {
    $this->user->update(['is_active' => false]);

    $response = $this->withHeaders(['referer' => 'http://localhost:3000'])->postJson('/api/login', [
        'email' => 'test@qollab.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(422)
             ->assertJsonValidationErrors(['email']);

    $this->assertGuest();
});

test('can retrieve user data when authenticated', function () {
    $this->actingAs($this->user);

    $response = $this->withHeaders(['referer' => 'http://localhost:3000'])->getJson('/api/user');

    $response->assertStatus(200)
             ->assertJsonPath('email', 'test@qollab.com');
});

test('cannot retrieve user data when not authenticated', function () {
    $response = $this->withHeaders(['referer' => 'http://localhost:3000'])->getJson('/api/user');
    
    $response->assertStatus(401);
});

test('can logout successfully', function () {
    $this->withHeaders(['referer' => 'http://localhost:3000'])->postJson('/api/login', [
        'email' => 'test@qollab.com',
        'password' => 'password123',
    ]);
    $this->assertAuthenticated();

    $response = $this->withHeaders(['referer' => 'http://localhost:3000'])->postJson('/api/logout');

    $response->assertStatus(204);
    $this->assertGuest('web');
});

test('login requests are rate limited', function () {
    for ($i = 0; $i < 5; $i++) {
        $this->withHeaders(['referer' => 'http://localhost:3000'])->postJson('/api/login', [
            'email' => 'test@qollab.com',
            'password' => 'wrongpassword',
        ]);
    }

    $response = $this->withHeaders(['referer' => 'http://localhost:3000'])->postJson('/api/login', [
        'email' => 'test@qollab.com',
        'password' => 'wrongpassword',
    ]);

    $response->assertStatus(422)
             ->assertJsonValidationErrors(['email']);
             
    $this->assertStringContainsString('Too many login attempts', $response->json('message'));
});
