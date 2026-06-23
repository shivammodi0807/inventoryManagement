<?php

use App\Modules\Inventory\Controllers\CategoryController;
use App\Modules\Inventory\Controllers\ProductController;
use App\Modules\Inventory\Controllers\StockController;
use App\Modules\Inventory\Controllers\UnitController;
use App\Modules\Inventory\Controllers\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'verified'])->group(function () {

    /**
     * WAREHOUSE ROUTES
     */
    Route::get('/warehouses', [WarehouseController::class, 'index'])->middleware('permission:view,warehouse');
    Route::post('/warehouses', [WarehouseController::class, 'store'])->middleware('permission:create,warehouse');
    Route::get('/warehouses/{warehouse}', [WarehouseController::class, 'show'])->middleware('permission:view,warehouse');
    Route::match(['put', 'patch'], '/warehouses/{warehouse}', [WarehouseController::class, 'update'])
        ->middleware('permission:edit,warehouse');
    Route::delete('/warehouses/{warehouse}', [WarehouseController::class, 'destroy'])
        ->middleware('permission:delete,warehouse');


    /**
     * CATEGORY ROUTES
     */
    Route::get('/categories/tree/hierarchy', [CategoryController::class, 'tree'])
        ->middleware('permission:view,category')->name('categories.tree');
    Route::get('/categories', [CategoryController::class, 'index'])->middleware('permission:view,category');
    Route::post('/categories', [CategoryController::class, 'store'])->middleware('permission:create,category');
    Route::get('/categories/{category}', [CategoryController::class, 'show'])->middleware('permission:view,category');
    Route::match(['put', 'patch'], '/categories/{category}', [CategoryController::class, 'update'])
        ->middleware('permission:edit,category');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])
        ->middleware('permission:delete,category');

    /**
     * UNIT ROUTES
     */
    Route::get('/units', [UnitController::class, 'index'])->middleware('permission:view,unit');
    Route::post('/units', [UnitController::class, 'store'])->middleware('permission:create,unit');
    Route::get('/units/{unit}', [UnitController::class, 'show'])->middleware('permission:view,unit');
    Route::match(['put', 'patch'], '/units/{unit}', [UnitController::class, 'update'])
        ->middleware('permission:edit,unit');
    Route::delete('/units/{unit}', [UnitController::class, 'destroy'])
        ->middleware('permission:delete,unit');

    /**
     * PRODUCT ROUTES
     * Low-stock endpoint MUST be defined before /{product} to avoid collision.
     */
    Route::get('/products/stats', [ProductController::class, 'stats'])
        ->middleware('permission:view,product')->name('products.stats');
    Route::get('/products/low-stock', [ProductController::class, 'lowStock'])
        ->middleware('permission:view,product')->name('products.low-stock');
    Route::get('/products', [ProductController::class, 'index'])->middleware('permission:view,product');
    Route::post('/products', [ProductController::class, 'store'])->middleware('permission:create,product');
    Route::get('/products/{product}', [ProductController::class, 'show'])->middleware('permission:view,product');
    Route::match(['put', 'patch'], '/products/{product}', [ProductController::class, 'update'])
        ->middleware('permission:edit,product');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])
        ->middleware('permission:delete,product');

    /**
     * STOCK ROUTES (nested under products) — gated as edit,product since they
     * mutate stock state. History is read-only.
     */
    Route::post('/products/{product}/adjust', [StockController::class, 'adjust'])
        ->middleware('permission:edit,product')->name('products.stock.adjust');
    Route::post('/products/{product}/receive', [StockController::class, 'receive'])
        ->middleware('permission:edit,product')->name('products.stock.receive');
    Route::get('/products/{product}/history', [StockController::class, 'history'])
        ->middleware('permission:view,product')->name('products.stock.history');
});
