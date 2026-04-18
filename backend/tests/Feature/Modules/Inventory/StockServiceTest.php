<?php

use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Models\Inventory\InventoryLog;
use App\Models\Inventory\Product;
use App\Models\Inventory\StockLevel;
use App\Models\Inventory\Warehouse;
use App\Modules\Inventory\Events\LowStockDetected;
use App\Modules\Inventory\Events\StockChanged;
use App\Modules\Inventory\Services\StockService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->adminRole = Role::factory()->admin()->create();
    $this->user = User::factory()->create(['role_id' => $this->adminRole->id]);
    $this->actingAs($this->user);

    $this->product = Product::factory()->create(['reorder_point' => 10]);
    $this->warehouse = Warehouse::factory()->create();
    $this->service = app(StockService::class);
});

test('adjustStock creates a stock row when none exists and records the log', function () {
    Event::fake([StockChanged::class]);

    $stock = $this->service->adjustStock(
        productId: $this->product->id,
        warehouseId: $this->warehouse->id,
        quantity: 25,
        type: 'receipt',
        notes: 'Initial receipt',
    );

    expect($stock)->toBeInstanceOf(StockLevel::class)
        ->and((int) $stock->current_stock)->toBe(25)
        ->and((int) $stock->total_stock)->toBe(25);

    $this->assertDatabaseHas('inventory_logs', [
        'product_id' => $this->product->id,
        'type' => 'receipt',
        'quantity_change' => 25,
        'quantity_before' => 0,
        'quantity_after' => 25,
        'user_id' => $this->user->id,
        'notes' => 'Initial receipt',
    ]);

    Event::assertDispatched(StockChanged::class, function (StockChanged $e) {
        return $e->productId === $this->product->id
            && $e->warehouseId === $this->warehouse->id
            && $e->quantityBefore === 0
            && $e->quantityAfter === 25
            && $e->type === 'receipt';
    });
});

test('adjustStock updates an existing stock row and records a log', function () {
    StockLevel::factory()->create([
        'product_id' => $this->product->id,
        'warehouse_id' => $this->warehouse->id,
        'total_stock' => 100,
        'stock_reserved' => 0,
        'current_stock' => 100,
    ]);

    $stock = $this->service->adjustStock(
        productId: $this->product->id,
        warehouseId: $this->warehouse->id,
        quantity: -30,
        type: 'sale',
    );

    expect((int) $stock->current_stock)->toBe(70)
        ->and((int) $stock->total_stock)->toBe(70);

    $this->assertDatabaseHas('inventory_logs', [
        'product_id' => $this->product->id,
        'type' => 'sale',
        'quantity_change' => -30,
        'quantity_before' => 100,
        'quantity_after' => 70,
    ]);
});

test('adjustStock throws DomainException when result would be negative', function () {
    StockLevel::factory()->create([
        'product_id' => $this->product->id,
        'warehouse_id' => $this->warehouse->id,
        'total_stock' => 5,
        'stock_reserved' => 0,
        'current_stock' => 5,
    ]);

    expect(fn () => $this->service->adjustStock(
        productId: $this->product->id,
        warehouseId: $this->warehouse->id,
        quantity: -10,
        type: 'sale',
    ))->toThrow(DomainException::class, 'Insufficient stock');

    // Row unchanged and no log written (transaction rolled back).
    $this->assertDatabaseHas('stock_levels', [
        'product_id' => $this->product->id,
        'warehouse_id' => $this->warehouse->id,
        'current_stock' => 5,
    ]);

    expect(InventoryLog::where('product_id', $this->product->id)->count())->toBe(0);
});

test('adjustStock fires StockChanged event on every adjustment', function () {
    Event::fake([StockChanged::class]);

    $this->service->adjustStock($this->product->id, $this->warehouse->id, 10, 'receipt');
    $this->service->adjustStock($this->product->id, $this->warehouse->id, -2, 'damage');
    $this->service->adjustStock($this->product->id, $this->warehouse->id, 5, 'return');

    Event::assertDispatched(StockChanged::class, 3);
});

test('adjustStock creates a new inventory_logs row for every adjustment', function () {
    $this->service->adjustStock($this->product->id, $this->warehouse->id, 50, 'receipt');
    $this->service->adjustStock($this->product->id, $this->warehouse->id, -10, 'sale');
    $this->service->adjustStock($this->product->id, $this->warehouse->id, -5, 'damage');

    expect(InventoryLog::where('product_id', $this->product->id)->count())->toBe(3);

    $latest = InventoryLog::where('product_id', $this->product->id)->latest()->first();
    expect($latest->type)->toBe('damage')
        ->and((int) $latest->quantity_before)->toBe(40)
        ->and((int) $latest->quantity_after)->toBe(35);
});

test('getProductHistory returns inventory logs newest-first and paginated', function () {
    $this->service->adjustStock($this->product->id, $this->warehouse->id, 10, 'receipt');
    $this->service->adjustStock($this->product->id, $this->warehouse->id, -1, 'sale');
    $this->service->adjustStock($this->product->id, $this->warehouse->id, -2, 'damage');

    $history = $this->service->getProductHistory($this->product->id, 15);

    expect($history->total())->toBe(3)
        ->and($history->first()->type)->toBe('damage');
});

test('adjustStock runs inside a DB transaction (event dispatched while tx is open)', function () {
    $levelDuringDispatch = null;

    Event::listen(StockChanged::class, function () use (&$levelDuringDispatch) {
        $levelDuringDispatch = DB::transactionLevel();
    });

    $this->service->adjustStock($this->product->id, $this->warehouse->id, 5, 'receipt');

    expect($levelDuringDispatch)->not->toBeNull()
        ->and($levelDuringDispatch)->toBeGreaterThan(0);
});

test('LowStockDetected fires when adjusted total reaches reorder point', function () {
    $captured = [];
    Event::listen(LowStockDetected::class, function (LowStockDetected $e) use (&$captured) {
        $captured[] = $e;
    });

    // reorder_point = 10; land exactly at 10 (<=).
    $this->service->adjustStock($this->product->id, $this->warehouse->id, 10, 'receipt');

    expect($captured)->toHaveCount(1)
        ->and($captured[0]->productId)->toBe($this->product->id)
        ->and($captured[0]->currentStock)->toBe(10)
        ->and($captured[0]->reorderPoint)->toBe(10);
});

test('LowStockDetected does not fire when stock is above reorder point', function () {
    $captured = [];
    Event::listen(LowStockDetected::class, function (LowStockDetected $e) use (&$captured) {
        $captured[] = $e;
    });

    $this->service->adjustStock($this->product->id, $this->warehouse->id, 50, 'receipt');

    expect($captured)->toBeEmpty();
});

test('InvalidateStockCache listener clears stock-related cache on adjustment', function () {
    $productKey = "product:{$this->product->id}:stock";

    Cache::put('dashboard:stats', 'cached-value', 60);
    Cache::put($productKey, 'cached-value', 60);

    expect(Cache::has('dashboard:stats'))->toBeTrue()
        ->and(Cache::has($productKey))->toBeTrue();

    $this->service->adjustStock($this->product->id, $this->warehouse->id, 5, 'receipt');

    expect(Cache::has('dashboard:stats'))->toBeFalse()
        ->and(Cache::has($productKey))->toBeFalse();
});
