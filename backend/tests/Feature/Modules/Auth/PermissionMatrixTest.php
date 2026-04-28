<?php

use App\Models\Auth\Permission;
use App\Models\Auth\Role;
use App\Models\Auth\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles, permissions and the default role-permission matrix
    // exactly as the production seeders do.
    $this->seed([
        \Database\Seeders\RoleSeeder::class,
        \Database\Seeders\PermissionSeeder::class,
        \Database\Seeders\RolePermissionSeeder::class,
    ]);

    $this->adminRole = Role::where('name', 'Admin')->firstOrFail();
    $this->managerRole = Role::where('name', 'Manager')->firstOrFail();
    $this->staffRole = Role::where('name', 'Staff')->firstOrFail();

    $this->admin = User::factory()->create([
        'email' => 'admin@qollab.test',
        'role_id' => $this->adminRole->id,
        'is_active' => true,
    ]);

    $this->manager = User::factory()->create([
        'email' => 'manager@qollab.test',
        'role_id' => $this->managerRole->id,
        'is_active' => true,
    ]);

    $this->staff = User::factory()->create([
        'email' => 'staff@qollab.test',
        'role_id' => $this->staffRole->id,
        'is_active' => true,
    ]);
});

// ---------- LIST (view,user) ----------

test('admin can list users', function () {
    $this->actingAs($this->admin)
        ->getJson('/api/users')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta']);
});

test('manager cannot list users', function () {
    // User management is admin-only by default; manager has no view,user perm.
    $this->actingAs($this->manager)
        ->getJson('/api/users')
        ->assertStatus(403);
});

test('staff cannot list users', function () {
    $this->actingAs($this->staff)
        ->getJson('/api/users')
        ->assertStatus(403);
});

test('guest cannot list users', function () {
    $this->getJson('/api/users')->assertStatus(401);
});

// ---------- CREATE via /api/users (create,user) ----------
// Admin user provisioning lives on POST /api/users now. Public self-service
// signup at /api/register is covered by RegistrationTest (Phase J).

test('admin can create a new user via /api/users', function () {
    $this->actingAs($this->admin)
        ->postJson('/api/users', [
            'full_name' => 'Brand New',
            'email' => 'new@qollab.test',
            'password' => 'StrongPass-123!',
            'role_id' => $this->staffRole->id,
        ])
        ->assertCreated()
        ->assertJsonPath('email', 'new@qollab.test')
        ->assertJsonPath('role.name', 'Staff');

    expect(User::where('email', 'new@qollab.test')->exists())->toBeTrue();
});

test('manager cannot create a new user via /api/users', function () {
    $this->actingAs($this->manager)
        ->postJson('/api/users', [
            'full_name' => 'X',
            'email' => 'x@qollab.test',
            'password' => 'StrongPass-123!',
            'role_id' => $this->staffRole->id,
        ])
        ->assertStatus(403);
});

test('staff cannot create a new user via /api/users', function () {
    $this->actingAs($this->staff)
        ->postJson('/api/users', [
            'full_name' => 'X',
            'email' => 'x@qollab.test',
            'password' => 'StrongPass-123!',
            'role_id' => $this->staffRole->id,
        ])
        ->assertStatus(403);
});

// ---------- UPDATE (edit,user) ----------

test('admin can update any user', function () {
    $this->actingAs($this->admin)
        ->putJson("/api/users/{$this->staff->id}", ['full_name' => 'Renamed'])
        ->assertOk()
        ->assertJsonPath('full_name', 'Renamed');
});

test('manager cannot update users', function () {
    $this->actingAs($this->manager)
        ->putJson("/api/users/{$this->staff->id}", ['full_name' => 'Renamed'])
        ->assertStatus(403);
});

test('staff cannot update users', function () {
    $this->actingAs($this->staff)
        ->putJson("/api/users/{$this->manager->id}", ['full_name' => 'Nope'])
        ->assertStatus(403);
});

// ---------- ROLES (view,user) ----------

test('admin can list roles for the user-create dropdown', function () {
    $this->actingAs($this->admin)
        ->getJson('/api/roles')
        ->assertOk()
        ->assertJsonStructure(['data' => [['id', 'name', 'description']]])
        ->assertJsonPath('data.0.name', 'Admin');
});

test('staff cannot list roles', function () {
    $this->actingAs($this->staff)
        ->getJson('/api/roles')
        ->assertStatus(403);
});

// ---------- DELETE (delete,user) ----------

test('admin can delete a user', function () {
    $this->actingAs($this->admin)
        ->deleteJson("/api/users/{$this->staff->id}")
        ->assertNoContent();
});

test('manager cannot delete a user', function () {
    $this->actingAs($this->manager)
        ->deleteJson("/api/users/{$this->staff->id}")
        ->assertStatus(403);
});

test('staff cannot delete a user', function () {
    $this->actingAs($this->staff)
        ->deleteJson("/api/users/{$this->manager->id}")
        ->assertStatus(403);
});
