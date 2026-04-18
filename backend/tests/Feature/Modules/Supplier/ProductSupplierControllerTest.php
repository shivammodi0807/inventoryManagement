<?php

use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Models\Inventory\Product;
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

function validLinkPayload(int $productId, array $overrides = []): array
{
    return array_merge([
        'product_id' => $productId,
        'supplier_sku' => 'SUP-SKU-001',
        'cost_price' => 9.50,
        'est_delivery_days' => 7,
        'is_preferred' => false,
        'min_order_qty' => 10,
    ], $overrides);
}

test('manager can link a product to a supplier with pricing', function () {
    $this->actingAs($this->manager);

    $supplier = Supplier::factory()->create();
    $product = Product::factory()->create();

    $response = $this->postJson(
        "/api/suppliers/{$supplier->id}/products",
        validLinkPayload($product->id)
    );

    $response->assertStatus(201);

    $this->assertDatabaseHas('product_supplier', [
        'supplier_id' => $supplier->id,
        'product_id' => $product->id,
        'supplier_sku' => 'SUP-SKU-001',
        'cost_price' => 9.50,
        'est_delivery_days' => 7,
        'min_order_qty' => 10,
    ]);
});

test('staff cannot link a product to a supplier and receives 403', function () {
    $this->actingAs($this->staff);

    $supplier = Supplier::factory()->create();
    $product = Product::factory()->create();

    $response = $this->postJson(
        "/api/suppliers/{$supplier->id}/products",
        validLinkPayload($product->id)
    );

    $response->assertStatus(403);
    $this->assertDatabaseMissing('product_supplier', [
        'supplier_id' => $supplier->id,
        'product_id' => $product->id,
    ]);
});

test('linking a non-existent product returns 422', function () {
    $this->actingAs($this->manager);

    $supplier = Supplier::factory()->create();

    $response = $this->postJson(
        "/api/suppliers/{$supplier->id}/products",
        validLinkPayload(99999)
    );

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['product_id']);
});

test('marking a supplier as preferred unsets preferred on other suppliers for same product', function () {
    $this->actingAs($this->manager);

    $product = Product::factory()->create();
    $supplierA = Supplier::factory()->create();
    $supplierB = Supplier::factory()->create();

    // Link A as preferred first.
    $this->postJson(
        "/api/suppliers/{$supplierA->id}/products",
        validLinkPayload($product->id, ['is_preferred' => true])
    )->assertStatus(201);

    $this->assertDatabaseHas('product_supplier', [
        'supplier_id' => $supplierA->id,
        'product_id' => $product->id,
        'is_preferred' => true,
    ]);

    // Now link B as preferred — should flip A to not preferred.
    $this->postJson(
        "/api/suppliers/{$supplierB->id}/products",
        validLinkPayload($product->id, ['is_preferred' => true])
    )->assertStatus(201);

    $this->assertDatabaseHas('product_supplier', [
        'supplier_id' => $supplierB->id,
        'product_id' => $product->id,
        'is_preferred' => true,
    ]);

    $this->assertDatabaseHas('product_supplier', [
        'supplier_id' => $supplierA->id,
        'product_id' => $product->id,
        'is_preferred' => false,
    ]);
});

test('manager can unlink a product from a supplier', function () {
    $this->actingAs($this->manager);

    $supplier = Supplier::factory()->create();
    $product = Product::factory()->create();

    $supplier->products()->attach($product->id, [
        'cost_price' => 5.00,
        'est_delivery_days' => 3,
        'is_preferred' => false,
        'min_order_qty' => 1,
    ]);

    $response = $this->deleteJson("/api/suppliers/{$supplier->id}/products/{$product->id}");

    $response->assertStatus(204);
    $this->assertDatabaseMissing('product_supplier', [
        'supplier_id' => $supplier->id,
        'product_id' => $product->id,
    ]);
});

test('unlinking from a non-existent link returns 404', function () {
    $this->actingAs($this->manager);

    $supplier = Supplier::factory()->create();
    $product = Product::factory()->create();

    $response = $this->deleteJson("/api/suppliers/{$supplier->id}/products/{$product->id}");

    $response->assertStatus(404);
});
