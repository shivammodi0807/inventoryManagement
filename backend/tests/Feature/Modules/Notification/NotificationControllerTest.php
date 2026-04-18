<?php

use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Models\Inventory\Product;
use App\Models\Inventory\Warehouse;
use App\Models\Purchase\PurchaseOrder;
use App\Models\Purchase\PurchaseOrderItem;
use App\Models\Supplier\Supplier;
use App\Modules\Inventory\Events\LowStockDetected;
use App\Modules\Inventory\Events\OverstockDetected;
use App\Modules\Notification\Notifications\LowStockNotification;
use App\Modules\Notification\Notifications\OverstockNotification;
use App\Modules\Notification\Notifications\PurchaseOrderStatusNotification;
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
});

test('LowStockDetected creates DB notifications for admins and managers only', function () {
    $product = Product::factory()->create(['name' => 'Widget', 'reorder_point' => 10]);

    event(new LowStockDetected(
        productId: $product->id,
        currentStock: 3,
        reorderPoint: 10,
    ));

    $this->assertDatabaseHas('notifications', [
        'notifiable_type' => User::class,
        'notifiable_id' => $this->admin->id,
        'type' => LowStockNotification::class,
    ]);
    $this->assertDatabaseHas('notifications', [
        'notifiable_type' => User::class,
        'notifiable_id' => $this->manager->id,
        'type' => LowStockNotification::class,
    ]);
    $this->assertDatabaseMissing('notifications', [
        'notifiable_type' => User::class,
        'notifiable_id' => $this->staff->id,
    ]);
});

test('low stock notification payload tags critical priority when at or below half of reorder point', function () {
    $product = Product::factory()->create(['name' => 'Bolt', 'reorder_point' => 10]);

    event(new LowStockDetected($product->id, 3, 10));

    $notification = $this->admin->notifications()->first();
    expect($notification)->not->toBeNull();

    $data = $notification->data;
    expect($data['type'])->toBe('low_stock');
    expect($data['priority'])->toBe('critical');
    expect($data['product_id'])->toBe($product->id);
    expect($data['action_url'])->toBe("/dashboard/products/{$product->id}");
});

test('OverstockDetected creates DB notifications for admins and managers only', function () {
    $product = Product::factory()->create(['name' => 'Crate', 'reorder_point' => 10]);

    event(new OverstockDetected(
        productId: $product->id,
        currentStock: 100,
        threshold: 30,
    ));

    $this->assertDatabaseHas('notifications', [
        'notifiable_type' => User::class,
        'notifiable_id' => $this->admin->id,
        'type' => OverstockNotification::class,
    ]);
    $this->assertDatabaseHas('notifications', [
        'notifiable_type' => User::class,
        'notifiable_id' => $this->manager->id,
        'type' => OverstockNotification::class,
    ]);
    $this->assertDatabaseMissing('notifications', [
        'notifiable_type' => User::class,
        'notifiable_id' => $this->staff->id,
    ]);

    $data = $this->admin->notifications()->first()->data;
    expect($data['type'])->toBe('overstock');
    expect($data['current_stock'])->toBe(100);
    expect($data['threshold'])->toBe(30);
    expect($data['priority'])->toBe('warning');
});

test('PurchaseOrderReceived notifies the PO creator', function () {
    $supplier = Supplier::factory()->create();
    $product = Product::factory()->create();
    $warehouse = Warehouse::factory()->create();

    $this->actingAs($this->manager);
    $po = PurchaseOrder::factory()->create([
        'supplier_id' => $supplier->id,
        'user_id' => $this->manager->id,
        'status' => PurchaseOrderStatus::Confirmed->value,
    ]);
    $item = PurchaseOrderItem::factory()->create([
        'purchase_order_id' => $po->id,
        'product_id' => $product->id,
        'qty_ordered' => 3,
        'qty_received' => 0,
        'cost_price' => 2.00,
    ]);

    $this->actingAs($this->staff);
    $this->postJson("/api/purchase-orders/{$po->id}/receive", [
        'warehouse_id' => $warehouse->id,
        'items' => [['item_id' => $item->id, 'qty_received' => 3]],
    ])->assertStatus(200);

    $this->assertDatabaseHas('notifications', [
        'notifiable_type' => User::class,
        'notifiable_id' => $this->manager->id,
        'type' => PurchaseOrderStatusNotification::class,
    ]);
});

test('index returns the authenticated user notifications paginated, newest first', function () {
    $product = Product::factory()->create();
    $this->admin->notify(new LowStockNotification($product->id, $product->name, 1, 10));
    $this->admin->notify(new LowStockNotification($product->id, $product->name, 2, 10));

    $response = $this->actingAs($this->admin)->getJson('/api/notifications');

    $response->assertStatus(200)
        ->assertJsonStructure(['data', 'current_page', 'per_page', 'total']);
    expect($response->json('total'))->toBe(2);
});

test('unread-count returns number of unread notifications for the user', function () {
    $product = Product::factory()->create();
    $this->admin->notify(new LowStockNotification($product->id, $product->name, 1, 10));
    $this->admin->notify(new LowStockNotification($product->id, $product->name, 2, 10));

    $this->actingAs($this->admin)
        ->getJson('/api/notifications/unread-count')
        ->assertStatus(200)
        ->assertJson(['count' => 2]);
});

test('markAsRead sets read_at on a single notification', function () {
    $product = Product::factory()->create();
    $this->admin->notify(new LowStockNotification($product->id, $product->name, 1, 10));
    $id = $this->admin->notifications()->first()->id;

    $this->actingAs($this->admin)
        ->patchJson("/api/notifications/{$id}/read")
        ->assertStatus(200);

    expect($this->admin->fresh()->unreadNotifications()->count())->toBe(0);
});

test('markAllAsRead marks every unread notification as read', function () {
    $product = Product::factory()->create();
    $this->admin->notify(new LowStockNotification($product->id, $product->name, 1, 10));
    $this->admin->notify(new LowStockNotification($product->id, $product->name, 2, 10));

    $this->actingAs($this->admin)
        ->patchJson('/api/notifications/read-all')
        ->assertStatus(200);

    expect($this->admin->fresh()->unreadNotifications()->count())->toBe(0);
});

test('notification endpoints require authentication', function () {
    $this->getJson('/api/notifications')->assertStatus(401);
    $this->getJson('/api/notifications/unread-count')->assertStatus(401);
    $this->patchJson('/api/notifications/read-all')->assertStatus(401);
});
