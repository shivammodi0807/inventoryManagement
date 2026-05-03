<?php

namespace App\Modules\Inventory\Providers;

use App\Modules\Inventory\Events\StockChanged;
use App\Modules\Inventory\Listeners\ApplyPurchaseOrderStock;
use App\Modules\Inventory\Listeners\CheckStockLevels;
use App\Modules\Inventory\Listeners\InvalidateStockCache;
use App\Modules\PurchaseOrder\Events\PurchaseOrderReceived;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class InventoryProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Route::middleware('api')->prefix('api')->group(__DIR__.'/../routes.php');

        Event::listen(StockChanged::class, CheckStockLevels::class);
        Event::listen(StockChanged::class, InvalidateStockCache::class);
        Event::listen(PurchaseOrderReceived::class, ApplyPurchaseOrderStock::class);
        Event::listen(\App\Modules\Sales\Events\SalesOrderConfirmed::class, \App\Modules\Inventory\Listeners\DeductSalesOrderStock::class);
    }
}
