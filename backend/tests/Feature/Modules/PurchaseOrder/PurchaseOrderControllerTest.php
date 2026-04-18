<?php

use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Models\Inventory\Product;
use App\Models\Purchase\PurchaseOrder;
use App\Models\Supplier\Supplier;
use App\Modules\PurchaseOrder\Enums\PurchaseOrderStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->adminRole = Role::factory()->admin()->create();
    $this->managerRole = Role::factory()->manager()->create();
    $this->staffRole = Role::factory()->staff()->create();

    $this->admin = User::factory()->create(['role_id' => $this->adminRole->id]);
    $this->manager = User::factory()->create(['role_id' => $this->managerRole->id]);
    $this->staff = User::factory()->create(['role_id' => $this->staffRole->id]);

    $this->supplier = Supplier::factory()->create();
    $this->product = Product::factory()->create();
});

function validPoPayload(array $overrides = []): array
{
    return array_merge([
        'supplier_id' => test()->supplier->id,
        'order_date' => now()->toDateString(),
        'exp_delivery' => now()->addDays(7)->toDateString(),
        'description' => 'Initial restock',
        'items' => [
            ['product_id' => test()->product->id, 'qty_ordered' => 10, 'cost_price' => 5.00],
        ],
    ], $overrides);
}

test('manager can create a PO and order_number is auto-generated', function () {
    $this->actingAs($this->manager);

    $response = $this->postJson('/api/purchase-orders', validPoPayload());

    $response->assertStatus(201)
        ->assertJsonPath('status', 'draft');

    expect((float) $response->json('total_amount'))->toBe(50.0);

    $orderNumber = $response->json('order_number');
    expect($orderNumber)->toMatch('/^PO-\d{4}-\d{4}$/');

    $this->assertDatabaseHas('purchase_orders', [
        'order_number' => $orderNumber,
        'supplier_id' => $this->supplier->id,
        'status' => 'draft',
    ]);
});

test('order_number increments per year', function () {
    $this->actingAs($this->manager);

    $a = $this->postJson('/api/purchase-orders', validPoPayload())->json('order_number');
    $b = $this->postJson('/api/purchase-orders', validPoPayload())->json('order_number');

    $year = now()->year;
    expect($a)->toBe("PO-{$year}-0001")
        ->and($b)->toBe("PO-{$year}-0002");
});

test('staff cannot create POs and receives 403', function () {
    $this->actingAs($this->staff);

    $response = $this->postJson('/api/purchase-orders', validPoPayload());

    $response->assertStatus(403);
});

test('manager can update a draft PO', function () {
    $this->actingAs($this->manager);

    $po = $this->postJson('/api/purchase-orders', validPoPayload())->json();

    $response = $this->putJson("/api/purchase-orders/{$po['id']}", [
        'description' => 'Updated description',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('description', 'Updated description');
});

test('cannot update a non-draft PO', function () {
    $this->actingAs($this->manager);

    $po = $this->postJson('/api/purchase-orders', validPoPayload())->json();
    $this->patchJson("/api/purchase-orders/{$po['id']}/submit")->assertStatus(200);

    $response = $this->putJson("/api/purchase-orders/{$po['id']}", [
        'description' => 'Too late',
    ]);

    $response->assertStatus(422);
});

test('manager can submit a draft PO', function () {
    $this->actingAs($this->manager);

    $po = $this->postJson('/api/purchase-orders', validPoPayload())->json();

    $response = $this->patchJson("/api/purchase-orders/{$po['id']}/submit");

    $response->assertStatus(200)->assertJsonPath('status', 'submitted');
});

test('only admin can confirm a submitted PO', function () {
    $this->actingAs($this->manager);
    $po = $this->postJson('/api/purchase-orders', validPoPayload())->json();
    $this->patchJson("/api/purchase-orders/{$po['id']}/submit")->assertStatus(200);

    // Manager forbidden.
    $this->patchJson("/api/purchase-orders/{$po['id']}/confirm")->assertStatus(403);

    // Admin succeeds.
    $this->actingAs($this->admin);
    $this->patchJson("/api/purchase-orders/{$po['id']}/confirm")
        ->assertStatus(200)
        ->assertJsonPath('status', 'confirmed');
});

test('confirming a non-submitted PO returns 422', function () {
    $this->actingAs($this->admin);

    $po = PurchaseOrder::factory()->create(['status' => PurchaseOrderStatus::Draft->value]);

    $response = $this->patchJson("/api/purchase-orders/{$po->id}/confirm");

    $response->assertStatus(422);
});

test('manager can cancel a PO from non-received state', function () {
    $this->actingAs($this->manager);

    $po = $this->postJson('/api/purchase-orders', validPoPayload())->json();

    $response = $this->patchJson("/api/purchase-orders/{$po['id']}/cancel");

    $response->assertStatus(200)->assertJsonPath('status', 'cancelled');
});
