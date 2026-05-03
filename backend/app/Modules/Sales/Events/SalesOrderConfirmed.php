<?php

namespace App\Modules\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SalesOrderConfirmed
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param  int  $orderId
     * @param  array<int, array{product_id:int, quantity:int}>  $items
     */
    public function __construct(
        public int $orderId,
        public array $items,
    ) {}
}
