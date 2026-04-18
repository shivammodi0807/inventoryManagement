<?php

namespace App\Modules\Inventory\Listeners;

use App\Models\Inventory\Product;
use App\Modules\Inventory\Events\LowStockDetected;
use App\Modules\Inventory\Events\OverstockDetected;
use App\Modules\Inventory\Events\StockChanged;

class CheckStockLevels
{
    /**
     * Handle the event: if a product's total available stock is at or below
     * its reorder point, fire a LowStockDetected event; if it exceeds the
     * overstock threshold (reorder_point * 3), fire an OverstockDetected event.
     */
    public function handle(StockChanged $event): void
    {
        $product = Product::with('stockLevels')->find($event->productId);

        if (! $product) {
            return;
        }

        $totalAvailable = (int) $product->stockLevels->sum('current_stock');
        $reorderPoint = (int) $product->reorder_point;

        if ($totalAvailable <= $reorderPoint) {
            event(new LowStockDetected(
                productId: $product->id,
                currentStock: $totalAvailable,
                reorderPoint: $reorderPoint,
            ));

            return;
        }

        $threshold = $reorderPoint * 3;

        if ($reorderPoint > 0 && $totalAvailable > $threshold) {
            event(new OverstockDetected(
                productId: $product->id,
                currentStock: $totalAvailable,
                threshold: $threshold,
            ));
        }
    }
}
