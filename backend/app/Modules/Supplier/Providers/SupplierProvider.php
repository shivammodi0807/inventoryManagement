<?php

namespace App\Modules\Supplier\Providers;

use App\Modules\PurchaseOrder\Events\PurchaseOrderReceived;
use App\Modules\Supplier\Listeners\UpdateSupplierRating;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class SupplierProvider extends ServiceProvider
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

        Event::listen(PurchaseOrderReceived::class, UpdateSupplierRating::class);
    }
}
