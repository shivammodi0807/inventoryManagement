<?php

namespace App\Modules\Notification\Providers;

use App\Modules\Inventory\Events\LowStockDetected;
use App\Modules\Inventory\Events\OverstockDetected;
use App\Modules\Notification\Listeners\HandleLowStockDetected;
use App\Modules\Notification\Listeners\HandleOverstockDetected;
use App\Modules\Notification\Listeners\HandlePurchaseOrderReceived;
use App\Modules\PurchaseOrder\Events\PurchaseOrderReceived;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class NotificationProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Route::middleware('api')->prefix('api')->group(__DIR__.'/../routes.php');

        Event::listen(LowStockDetected::class, HandleLowStockDetected::class);
        Event::listen(OverstockDetected::class, HandleOverstockDetected::class);
        Event::listen(PurchaseOrderReceived::class, HandlePurchaseOrderReceived::class);
    }
}
