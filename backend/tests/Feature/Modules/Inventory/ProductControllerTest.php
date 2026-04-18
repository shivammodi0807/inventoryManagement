<?php

use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Models\Inventory\Category;
use App\Models\Inventory\Product;
use App\Models\Inventory\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->adminRole = Role::factory()->admin()->create();
    $this->staffRole = Role::factory()->staff()->create();

    $this->admin = User::factory()->create(['role_id' => $this->adminRole->id]);
    $this->staff = User::factory()->create(['role_id' => $this->staffRole->id]);

    $this->category = Category::factory()->create();
    $this->unit = Unit::factory()->create();
});

function validProductPayload(array $overrides = []): array
{
    return array_merge([
        'sku' => 'WIDGET-001',
        'name' => 'Blue Widget',
        'description' => 'Standard blue widget',
        'category_id' => test()->category->id,
        'unit_id' => test()->unit->id,
        'unit_price' => 19.99,
        'cost_price' => 12.50,
        'reorder_point' => 10,
        'reorder_quantity' => 20,
        'lead_time_days' => 5,
        'is_active' => true,
    ], $overrides);
}

test('admin can create a product with valid data and SKU is persisted', function () {
    $this->actingAs($this->admin);

    $response = $this->postJson('/api/products', validProductPayload());

    $response->assertStatus(201)
        ->assertJsonPath('sku', 'WIDGET-001')
        ->assertJsonPath('name', 'Blue Widget');

    $this->assertDatabaseHas('products', [
        'sku' => 'WIDGET-001',
        'name' => 'Blue Widget',
        'user_id' => $this->admin->id,
    ]);
});

test('creating a product with a duplicate SKU returns 422', function () {
    $this->actingAs($this->admin);

    Product::factory()->create(['sku' => 'WIDGET-001']);

    $response = $this->postJson('/api/products', validProductPayload(['sku' => 'WIDGET-001']));

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['sku']);
});

test('staff cannot create products and receives 403', function () {
    $this->actingAs($this->staff);

    $response = $this->postJson('/api/products', validProductPayload());

    $response->assertStatus(403);

    $this->assertDatabaseMissing('products', ['sku' => 'WIDGET-001']);
});

test('product index search matches by name', function () {
    $this->actingAs($this->admin);

    Product::factory()->create(['sku' => 'ABC-111', 'name' => 'Red Apple']);
    Product::factory()->create(['sku' => 'ABC-222', 'name' => 'Green Banana']);
    Product::factory()->create(['sku' => 'ABC-333', 'name' => 'Yellow Apple']);

    $response = $this->getJson('/api/products?search=Apple');

    $response->assertStatus(200);
    $skus = collect($response->json('data'))->pluck('sku')->all();

    expect($skus)->toHaveCount(2)
        ->and($skus)->toContain('ABC-111')
        ->and($skus)->toContain('ABC-333');
});

test('product index search matches by SKU', function () {
    $this->actingAs($this->admin);

    Product::factory()->create(['sku' => 'WIDGET-RED', 'name' => 'Thing One']);
    Product::factory()->create(['sku' => 'GADGET-BLU', 'name' => 'Thing Two']);

    $response = $this->getJson('/api/products?search=WIDGET');

    $response->assertStatus(200);
    $skus = collect($response->json('data'))->pluck('sku')->all();

    expect($skus)->toHaveCount(1)
        ->and($skus)->toContain('WIDGET-RED');
});

test('unauthenticated users cannot create products', function () {
    $response = $this->postJson('/api/products', validProductPayload());

    $response->assertStatus(401);
});

test('admin can retrieve a product by id', function () {
    $this->actingAs($this->admin);

    $product = Product::factory()->create(['sku' => 'SHOW-001']);

    $response = $this->getJson("/api/products/{$product->id}");

    $response->assertStatus(200)
        ->assertJsonPath('sku', 'SHOW-001');
});

test('admin can soft-delete a product', function () {
    $this->actingAs($this->admin);

    $product = Product::factory()->create();

    $response = $this->deleteJson("/api/products/{$product->id}");

    $response->assertStatus(204);
    $this->assertSoftDeleted('products', ['id' => $product->id]);
});
