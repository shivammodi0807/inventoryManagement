<?php

namespace App\Modules\PurchaseOrder\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class PurchaseOrderProvider extends ServiceProvider
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
        $this->loadViewsFrom(__DIR__.'/../Resources/views', 'purchase-order');
        Route::middleware('api')->prefix('api')->group(__DIR__.'/../routes.php');
    }
}
