<?php

use App\Modules\Inventory\Controllers\CategoryController;
use App\Modules\Inventory\Controllers\ProductController;
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
    Route::apiResource('products', ProductController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
});
