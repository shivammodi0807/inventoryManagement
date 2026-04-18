<?php

use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Models\Inventory\Product;
use App\Models\Inventory\StockLevel;
use App\Models\Inventory\Warehouse;
use App\Models\Purchase\PurchaseOrder;
use App\Models\Purchase\PurchaseOrderItem;
use App\Models\Supplier\Supplier;
use App\Modules\PurchaseOrder\Enums\PurchaseOrderStatus;
use App\Modules\PurchaseOrder\Events\PurchaseOrderReceived;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->adminRole = Role::factory()->admin()->create();
    $this->managerRole = Role::factory()->manager()->create();
    $this->staffRole = Role::factory()->staff()->create();

    $this->admin = User::factory()->create(['role_id' => $this->adminRole->id]);
    $this->manager = User::factory()->create(['role_id' => $this->managerRole->id]);
    $this->staff = User::factory()->create(['role_id' => $this->staffRole->id]);

    $this->supplier = Supplier::factory()->create();
    $this->product = Product::factory()->create(['reorder_point' => 5]);
    $this->warehouse = Warehouse::factory()->create();
});

function makeConfirmedPo(int $supplierId, int $productId, int $qty = 10, float $cost = 4.00): PurchaseOrder
{
    $po = PurchaseOrder::factory()->create([
        'supplier_id' => $supplierId,
        'status' => PurchaseOrderStatus::Confirmed->value,
    ]);
    PurchaseOrderItem::factory()->create([
        'purchase_order_id' => $po->id,
        'product_id' => $productId,
        'qty_ordered' => $qty,
        'qty_received' => 0,
        'cost_price' => $cost,
    ]);

    return $po->fresh('items');
}

test('staff can receive full stock and PO becomes received', function () {
    $this->actingAs($this->staff);

    $po = makeConfirmedPo($this->supplier->id, $this->product->id, 10);
    $item = $po->items->first();

    $response = $this->postJson("/api/purchase-orders/{$po->id}/receive", [
        'warehouse_id' => $this->warehouse->id,
        'items' => [['item_id' => $item->id, 'qty_received' => 10]],
    ]);

    $response->assertStatus(200)->assertJsonPath('status', 'received');
    $this->assertDatabaseHas('purchase_order_items', [
        'id' => $item->id,
        'qty_received' => 10,
    ]);
});

test('partial receive sets status partially_received', function () {
    $this->actingAs($this->staff);

    $po = makeConfirmedPo($this->supplier->id, $this->product->id, 10);
    $item = $po->items->first();

    $response = $this->postJson("/api/purchase-orders/{$po->id}/receive", [
        'warehouse_id' => $this->warehouse->id,
        'items' => [['item_id' => $item->id, 'qty_received' => 4]],
    ]);

    $response->assertStatus(200)->assertJsonPath('status', 'partially_received');
    $this->assertDatabaseHas('purchase_order_items', [
        'id' => $item->id,
        'qty_received' => 4,
    ]);
});

test('cannot receive more than qty_ordered (excess capped)', function () {
    $this->actingAs($this->staff);

    $po = makeConfirmedPo($this->supplier->id, $this->product->id, 5);
    $item = $po->items->first();

    $this->postJson("/api/purchase-orders/{$po->id}/receive", [
        'warehouse_id' => $this->warehouse->id,
        'items' => [['item_id' => $item->id, 'qty_received' => 100]],
    ])->assertStatus(200);

    $this->assertDatabaseHas('purchase_order_items', [
        'id' => $item->id,
        'qty_received' => 5,
    ]);
});

test('cannot receive a draft PO', function () {
    $this->actingAs($this->staff);

    $po = PurchaseOrder::factory()->create([
        'supplier_id' => $this->supplier->id,
        'status' => PurchaseOrderStatus::Draft->value,
    ]);
    $item = PurchaseOrderItem::factory()->create([
        'purchase_order_id' => $po->id,
        'product_id' => $this->product->id,
        'qty_ordered' => 5,
    ]);

    $response = $this->postJson("/api/purchase-orders/{$po->id}/receive", [
        'warehouse_id' => $this->warehouse->id,
        'items' => [['item_id' => $item->id, 'qty_received' => 5]],
    ]);

    $response->assertStatus(422);
});

test('PurchaseOrderReceived event fires on receive', function () {
    Event::fake([PurchaseOrderReceived::class]);
    $this->actingAs($this->staff);

    $po = makeConfirmedPo($this->supplier->id, $this->product->id, 5);
    $item = $po->items->first();

    $this->postJson("/api/purchase-orders/{$po->id}/receive", [
        'warehouse_id' => $this->warehouse->id,
        'items' => [['item_id' => $item->id, 'qty_received' => 5]],
    ])->assertStatus(200);

    Event::assertDispatched(PurchaseOrderReceived::class, function (PurchaseOrderReceived $e) use ($po, $item) {
        return $e->orderId === $po->id
            && $e->warehouseId === $this->warehouse->id
            && count($e->items) === 1
            && $e->items[0]['product_id'] === $item->product_id
            && $e->items[0]['quantity'] === 5;
    });
});

test('receiving a PO adjusts stock via ApplyPurchaseOrderStock listener', function () {
    $this->actingAs($this->staff);

    $po = makeConfirmedPo($this->supplier->id, $this->product->id, 7);
    $item = $po->items->first();

    $this->postJson("/api/purchase-orders/{$po->id}/receive", [
        'warehouse_id' => $this->warehouse->id,
        'items' => [['item_id' => $item->id, 'qty_received' => 7]],
    ])->assertStatus(200);

    $this->assertDatabaseHas('stock_levels', [
        'product_id' => $this->product->id,
        'warehouse_id' => $this->warehouse->id,
        'current_stock' => 7,
        'total_stock' => 7,
    ]);

    $this->assertDatabaseHas('inventory_logs', [
        'product_id' => $this->product->id,
        'type' => 'receipt',
        'quantity_change' => 7,
    ]);
});

test('unauthenticated users cannot receive stock', function () {
    $po = makeConfirmedPo($this->supplier->id, $this->product->id);
    $item = $po->items->first();

    $response = $this->postJson("/api/purchase-orders/{$po->id}/receive", [
        'warehouse_id' => $this->warehouse->id,
        'items' => [['item_id' => $item->id, 'qty_received' => 1]],
    ]);

    $response->assertStatus(401);
    // Nudge for linter: reference StockLevel so the import is kept.
    expect(StockLevel::count())->toBe(0);
});
