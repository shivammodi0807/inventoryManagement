<?php

namespace App\Modules\Inventory\Services;

use App\Models\Inventory\InventoryLog;
use App\Models\Inventory\StockLevel;
use App\Modules\Inventory\Events\StockChanged;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StockService
{
    /**
     * Adjust stock with full audit trail and row-level locking.
     *
     * @param  int  $productId  Product to adjust
     * @param  int  $warehouseId  Warehouse location
     * @param  int  $quantity  Positive = add, Negative = remove
     * @param  string  $type  receipt|sale|adjustment|transfer|return|damage
     * @param  string|null  $notes  Reason for adjustment
     *
     * @throws DomainException When adjustment would drive stock below zero.
     */
    public function adjustStock(
        int $productId,
        int $warehouseId,
        int $quantity,
        string $type,
        ?string $notes = null,
    ): StockLevel {
        return DB::transaction(function () use ($productId, $warehouseId, $quantity, $type, $notes) {
            // 1. Lock the stock row (prevents race conditions).
            $stock = StockLevel::where('product_id', $productId)
                ->where('warehouse_id', $warehouseId)
                ->lockForUpdate()
                ->first();

            if (! $stock) {
                $stock = StockLevel::create([
                    'product_id' => $productId,
                    'warehouse_id' => $warehouseId,
                    'total_stock' => 0,
                    'stock_reserved' => 0,
                    'current_stock' => 0,
                    'stock_verified_on' => now(),
                ]);
            }

            $quantityBefore = (int) $stock->current_stock;

            // 2. Validate: if removing stock, ensure we don't go negative.
            if ($quantityBefore + $quantity < 0) {
                throw new DomainException(
                    "Insufficient stock. Available: {$quantityBefore}, Requested: " . abs($quantity)
                );
            }

            // 3. Update stock (both total_stock and current_stock move by quantity; for removals, total_stock remains unchanged).
            $stock->total_stock = (int) $stock->total_stock + $quantity;
            $stock->current_stock = $quantityBefore + $quantity;
            $stock->save();

            // 4. Create audit log.
            InventoryLog::create([
                'product_id' => $productId,
                'type' => $type,
                'quantity_change' => $quantity,
                'quantity_before' => $quantityBefore,
                'quantity_after' => $stock->current_stock,
                'notes' => $notes,
                'user_id' => Auth::id(),
            ]);

            // firing event after transaction commit to ensure listeners see the updated stock state
            event(new StockChanged(
                productId: $productId,
                warehouseId: $warehouseId,
                quantityBefore: $quantityBefore,
                quantityAfter: (int) $stock->current_stock,
                type: $type,
            ));

            return $stock;
        });
    }

    /**
     * Get paginated inventory log history for a product.
     *
     * @param  int  $productId  Product ID
     * @param  int  $perPage  Items per page
     */
    public function getProductHistory(int $productId, int $perPage = 15): LengthAwarePaginator
    {
        return InventoryLog::with('user')
            ->where('product_id', $productId)
            ->latest()
            ->paginate($perPage);
    }
}
