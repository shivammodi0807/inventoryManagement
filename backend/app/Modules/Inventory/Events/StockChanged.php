<?php

namespace App\Modules\Inventory\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StockChanged
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public int $productId,
        public int $warehouseId,
        public int $quantityBefore,
        public int $quantityAfter,
        public string $type,
    ) {}
}
