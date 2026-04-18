<?php

use App\Modules\Inventory\Controllers\CategoryController;
use App\Modules\Inventory\Controllers\ProductController;
use App\Modules\Inventory\Controllers\StockController;
use App\Modules\Inventory\Controllers\UnitController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {

    /**
     * CATEGORY ROUTES
     */
    Route::apiResource('categories', CategoryController::class);

    // ROUTE TO GET THE CATEGORY HIERARCHY
    Route::get('/categories/tree/hierarchy', [CategoryController::class, 'tree'])->name('categories.tree');

    /**
     * UNIT ROUTES
     */
    Route::apiResource('units', UnitController::class)->only(['store', 'index', 'show', 'update', 'destroy']);

    /**
     * PRODUCT ROUTES
     */
    // Low-stock endpoint MUST be defined before apiResource to avoid collision with /products/{product}
    Route::get('/products/low-stock', [ProductController::class, 'lowStock'])->name('products.low-stock');
    Route::apiResource('products', ProductController::class)->only(['index', 'store', 'show', 'update', 'destroy']);

    /**
     * STOCK ROUTES (nested under products)
     */
    Route::post('/products/{product}/adjust', [StockController::class, 'adjust'])->name('products.stock.adjust');
    Route::post('/products/{product}/receive', [StockController::class, 'receive'])->name('products.stock.receive');
    Route::get('/products/{product}/history', [StockController::class, 'history'])->name('products.stock.history');
});
