<?php

namespace App\Modules\Inventory\Listeners;

use App\Modules\Inventory\Services\StockService;
use App\Modules\Sales\Events\SalesOrderConfirmed;
use Illuminate\Support\Facades\Log;

/**
 * When a Sales Order is confirmed, deduct the items from inventory.
 */
class DeductSalesOrderStock
{
    public function __construct(private StockService $stockService) {}

    public function handle(SalesOrderConfirmed $event): void
    {
        foreach ($event->items as $item) {
            try {
                $this->stockService->adjustStock(
                    productId: (int) $item['product_id'],
                    warehouseId: (int) $item['warehouse_id'],
                    quantity: - (int) $item['quantity'], // Negative for sales deduction
                    type: 'sale',
                    notes: "Sales Order #{$event->orderId} confirmed",
                );
            } catch (\Exception $e) {
                Log::error("Failed to deduct stock for Sales Order #{$event->orderId}: " . $e->getMessage());
                // Re-throwing allows the database transaction in SalesOrderService to roll back
                throw $e;
            }
        }
    }
}
