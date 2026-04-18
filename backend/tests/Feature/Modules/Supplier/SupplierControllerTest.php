<?php

use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Models\Supplier\Supplier;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->adminRole = Role::factory()->admin()->create();
    $this->managerRole = Role::factory()->manager()->create();
    $this->staffRole = Role::factory()->staff()->create();

    $this->admin = User::factory()->create(['role_id' => $this->adminRole->id]);
    $this->manager = User::factory()->create(['role_id' => $this->managerRole->id]);
    $this->staff = User::factory()->create(['role_id' => $this->staffRole->id]);
});

function validSupplierPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Acme Widgets Inc',
        'contact_name' => 'Jane Doe',
        'email' => 'jane@acme.test',
        'phone' => '555-1234',
        'address' => '123 Main St',
        'city' => 'Springfield',
        'country' => 'USA',
        'payment_terms' => 'Net 30',
        'rating' => 4.5,
        'is_active' => true,
    ], $overrides);
}

test('admin can create a supplier with valid data', function () {
    $this->actingAs($this->admin);

    $response = $this->postJson('/api/suppliers', validSupplierPayload());

    $response->assertStatus(201)
        ->assertJsonPath('name', 'Acme Widgets Inc')
        ->assertJsonPath('email', 'jane@acme.test');

    $this->assertDatabaseHas('suppliers', [
        'name' => 'Acme Widgets Inc',
        'email' => 'jane@acme.test',
        'is_active' => true,
    ]);
});

test('manager can create a supplier', function () {
    $this->actingAs($this->manager);

    $response = $this->postJson('/api/suppliers', validSupplierPayload(['name' => 'Beta Co']));

    $response->assertStatus(201);
    $this->assertDatabaseHas('suppliers', ['name' => 'Beta Co']);
});

test('staff cannot create suppliers and receives 403', function () {
    $this->actingAs($this->staff);

    $response = $this->postJson('/api/suppliers', validSupplierPayload());

    $response->assertStatus(403);
    $this->assertDatabaseMissing('suppliers', ['name' => 'Acme Widgets Inc']);
});

test('unauthenticated users cannot create suppliers', function () {
    $response = $this->postJson('/api/suppliers', validSupplierPayload());

    $response->assertStatus(401);
});

test('creating a supplier without a name returns 422', function () {
    $this->actingAs($this->admin);

    $response = $this->postJson('/api/suppliers', validSupplierPayload(['name' => '']));

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name']);
});

test('admin can retrieve a supplier by id', function () {
    $this->actingAs($this->admin);

    $supplier = Supplier::factory()->create(['name' => 'Lookup Co']);

    $response = $this->getJson("/api/suppliers/{$supplier->id}");

    $response->assertStatus(200)
        ->assertJsonPath('name', 'Lookup Co');
});

test('supplier index search matches by name', function () {
    $this->actingAs($this->admin);

    Supplier::factory()->create(['name' => 'Red Apple Supplies']);
    Supplier::factory()->create(['name' => 'Green Banana Co']);
    Supplier::factory()->create(['name' => 'Yellow Apple Traders']);

    $response = $this->getJson('/api/suppliers?search=Apple');

    $response->assertStatus(200);
    $names = collect($response->json('data'))->pluck('name')->all();

    expect($names)->toHaveCount(2)
        ->and($names)->toContain('Red Apple Supplies')
        ->and($names)->toContain('Yellow Apple Traders');
});

test('manager can update a supplier', function () {
    $this->actingAs($this->manager);

    $supplier = Supplier::factory()->create(['name' => 'Old Name']);

    $response = $this->putJson("/api/suppliers/{$supplier->id}", [
        'name' => 'New Name',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('name', 'New Name');

    $this->assertDatabaseHas('suppliers', ['id' => $supplier->id, 'name' => 'New Name']);
});

test('admin deactivating a supplier sets is_active=false', function () {
    $this->actingAs($this->admin);

    $supplier = Supplier::factory()->create(['is_active' => true]);

    $response = $this->deleteJson("/api/suppliers/{$supplier->id}");

    $response->assertStatus(204);
    $this->assertDatabaseHas('suppliers', [
        'id' => $supplier->id,
        'is_active' => false,
    ]);
});

test('manager cannot deactivate a supplier and receives 403', function () {
    $this->actingAs($this->manager);

    $supplier = Supplier::factory()->create(['is_active' => true]);

    $response = $this->deleteJson("/api/suppliers/{$supplier->id}");

    $response->assertStatus(403);
    $this->assertDatabaseHas('suppliers', ['id' => $supplier->id, 'is_active' => true]);
});
