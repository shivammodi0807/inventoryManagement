<?php

use App\Modules\Supplier\Controllers\ProductSupplierController;
use App\Modules\Supplier\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    /**
     * SUPPLIER CRUD. delete,supplier is admin-only by default per the seeder.
     */
    Route::get('/suppliers', [SupplierController::class, 'index'])->middleware('permission:view,supplier');
    Route::post('/suppliers', [SupplierController::class, 'store'])->middleware('permission:create,supplier');
    Route::get('/suppliers/{supplier}', [SupplierController::class, 'show'])->middleware('permission:view,supplier');
    Route::match(['put', 'patch'], '/suppliers/{supplier}', [SupplierController::class, 'update'])
        ->middleware('permission:edit,supplier');
    Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])
        ->middleware('permission:delete,supplier');

    /**
     * SUPPLIER PERFORMANCE — operationally privileged (matches policy:edit).
     */
    Route::get('/suppliers/{id}/performance', [SupplierController::class, 'performance'])
        ->middleware('permission:edit,supplier')->name('suppliers.performance');

    /**
     * PRODUCT <-> SUPPLIER LINK MANAGEMENT
     */
    Route::post('/suppliers/{supplier}/products', [ProductSupplierController::class, 'store'])
        ->middleware('permission:edit,supplier')->name('suppliers.products.store');
    Route::delete('/suppliers/{supplier}/products/{productId}', [ProductSupplierController::class, 'destroy'])
        ->middleware('permission:edit,supplier')->name('suppliers.products.destroy');
});
