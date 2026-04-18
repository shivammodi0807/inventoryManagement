<?php

namespace App\Modules\Inventory\Listeners;

use App\Modules\Inventory\Services\StockService;
use App\Modules\PurchaseOrder\Events\PurchaseOrderReceived;

/**
 * When stock is received against a PO, apply it to the inventory via StockService.
 *
 * Each received line = one StockService::adjustStock(type: 'receipt').
 */
class ApplyPurchaseOrderStock
{
    public function __construct(private StockService $stockService) {}

    public function handle(PurchaseOrderReceived $event): void
    {
        foreach ($event->items as $item) {
            if ((int) ($item['quantity'] ?? 0) <= 0) {
                continue;
            }

            $this->stockService->adjustStock(
                productId: (int) $item['product_id'],
                warehouseId: $event->warehouseId,
                quantity: (int) $item['quantity'],
                type: 'receipt',
                notes: "PO #{$event->orderId} received",
            );
        }
    }
}
