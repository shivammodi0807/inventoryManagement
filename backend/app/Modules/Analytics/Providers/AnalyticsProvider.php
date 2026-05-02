<?php

namespace App\Modules\Analytics\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class AnalyticsProvider extends ServiceProvider
{
    public function register(): void
    {
        // Register any module-specific services here
    }

    public function boot(): void
    {
        // Load the module's API routes
        Route::prefix('api')
            ->middleware('api')
            ->group(__DIR__ . '/../routes.php');

        // Bust cache on relevant events
        \Illuminate\Support\Facades\Event::listen(
            \App\Modules\Inventory\Events\StockChanged::class,
            [\App\Modules\Analytics\Listeners\BustDashboardCache::class, 'handle']
        );
        
        \Illuminate\Support\Facades\Event::listen(
            \App\Modules\PurchaseOrder\Events\PurchaseOrderReceived::class,
            [\App\Modules\Analytics\Listeners\BustDashboardCache::class, 'handle']
        );
    }
}
