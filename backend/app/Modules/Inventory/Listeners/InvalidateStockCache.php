<?php

namespace App\Modules\Inventory\Listeners;

use App\Modules\Inventory\Events\StockChanged;
use Illuminate\Support\Facades\Cache;

class InvalidateStockCache
{
    /**
     * Bust cache entries that depend on stock state.
     */
    public function handle(StockChanged $event): void
    {
        Cache::forget('dashboard:stats');
        Cache::forget("product:{$event->productId}:stock");
    }
}
