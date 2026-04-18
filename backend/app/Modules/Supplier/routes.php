<?php

use App\Modules\Supplier\Controllers\ProductSupplierController;
use App\Modules\Supplier\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    /**
     * SUPPLIER CRUD
     */
    Route::apiResource('suppliers', SupplierController::class)
        ->only(['index', 'store', 'show', 'update', 'destroy']);

    /**
     * SUPPLIER PERFORMANCE
     */
    Route::get('/suppliers/{id}/performance', [SupplierController::class, 'performance'])
        ->name('suppliers.performance');

    /**
     * PRODUCT <-> SUPPLIER LINK MANAGEMENT
     */
    Route::post('/suppliers/{supplier}/products', [ProductSupplierController::class, 'store'])
        ->name('suppliers.products.store');
    Route::delete('/suppliers/{supplier}/products/{productId}', [ProductSupplierController::class, 'destroy'])
        ->name('suppliers.products.destroy');
});
