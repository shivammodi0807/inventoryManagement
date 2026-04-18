<?php

use App\Modules\PurchaseOrder\Controllers\PurchaseOrderController;
use App\Modules\PurchaseOrder\Controllers\ReceivePurchaseOrderController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    /**
     * PURCHASE ORDER CRUD
     */
    Route::apiResource('purchase-orders', PurchaseOrderController::class)
        ->only(['index', 'store', 'show', 'update']);

    /**
     * STATUS TRANSITIONS
     */
    Route::patch('/purchase-orders/{id}/submit', [PurchaseOrderController::class, 'submit'])
        ->name('purchase-orders.submit');
    Route::patch('/purchase-orders/{id}/confirm', [PurchaseOrderController::class, 'confirm'])
        ->name('purchase-orders.confirm');
    Route::patch('/purchase-orders/{id}/cancel', [PurchaseOrderController::class, 'cancel'])
        ->name('purchase-orders.cancel');

    /**
     * RECEIVE STOCK
     */
    Route::post('/purchase-orders/{id}/receive', ReceivePurchaseOrderController::class)
        ->name('purchase-orders.receive');
});
