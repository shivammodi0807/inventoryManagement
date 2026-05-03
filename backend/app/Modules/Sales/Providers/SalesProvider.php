<?php

namespace App\Modules\Sales\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class SalesProvider extends ServiceProvider
{
    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__.'/../Resources/views', 'sales');
        Route::middleware('api')->prefix('api')->group(__DIR__.'/../routes.php');
    }
}
