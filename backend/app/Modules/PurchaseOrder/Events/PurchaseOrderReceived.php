<?php

namespace App\Modules\PurchaseOrder\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PurchaseOrderReceived
{
    use Dispatchable, SerializesModels;

    /**
     * @param  int  $orderId  Purchase order id.
     * @param  int  $warehouseId  Warehouse stock is received into.
     * @param  array<int, array{product_id: int, quantity: int, cost_price: float|int|string}>  $items
     */
    public function __construct(
        public int $orderId,
        public int $warehouseId,
        public array $items,
    ) {}
}
