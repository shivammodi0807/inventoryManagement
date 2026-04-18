<?php

namespace App\Modules\Inventory\Listeners;

use App\Models\Inventory\Product;
use App\Modules\Inventory\Events\LowStockDetected;
use App\Modules\Inventory\Events\StockChanged;

class CheckStockLevels
{
    /**
     * Handle the event: if a product's total available stock is at or below
     * its reorder point, fire a LowStockDetected event.
     */
    public function handle(StockChanged $event): void
    {
        $product = Product::with('stockLevels')->find($event->productId);

        if (! $product) {
            return;
        }

        $totalAvailable = (int) $product->stockLevels->sum('current_stock');

        if ($totalAvailable <= (int) $product->reorder_point) {
            event(new LowStockDetected(
                productId: $product->id,
                currentStock: $totalAvailable,
                reorderPoint: (int) $product->reorder_point,
            ));
        }
    }
}
