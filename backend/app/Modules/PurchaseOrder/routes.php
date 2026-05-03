<?php

use App\Modules\PurchaseOrder\Controllers\PurchaseOrderController;
use App\Modules\PurchaseOrder\Controllers\ReceivePurchaseOrderController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    /**
     * PURCHASE ORDER CRUD
     */
    Route::get('/purchase-orders', [PurchaseOrderController::class, 'index'])
        ->middleware('permission:view,purchase_order');
    Route::post('/purchase-orders', [PurchaseOrderController::class, 'store'])
        ->middleware('permission:create,purchase_order');
    Route::get('/purchase-orders/{purchase_order}', [PurchaseOrderController::class, 'show'])
        ->middleware('permission:view,purchase_order');
    Route::match(['put', 'patch'], '/purchase-orders/{purchase_order}', [PurchaseOrderController::class, 'update'])
        ->middleware('permission:edit,purchase_order');
    Route::get('/purchase-orders/{id}/export', [PurchaseOrderController::class, 'export'])
        ->middleware('permission:view,purchase_order');
    Route::post('/purchase-orders/quick-create', [PurchaseOrderController::class, 'quickCreate'])
        ->middleware('permission:create,purchase_order');
    Route::post('/purchase-orders/bulk', [PurchaseOrderController::class, 'bulkStore'])
        ->middleware('permission:create,purchase_order');

    /**
     * STATUS TRANSITIONS. confirm is mapped to delete,purchase_order so it's
     * admin-only by default; admins can grant it elsewhere via the role UI.
     */
    Route::patch('/purchase-orders/{id}/submit', [PurchaseOrderController::class, 'submit'])
        ->middleware('permission:edit,purchase_order')->name('purchase-orders.submit');
    Route::patch('/purchase-orders/{id}/confirm', [PurchaseOrderController::class, 'confirm'])
        ->middleware('permission:delete,purchase_order')->name('purchase-orders.confirm');
    Route::patch('/purchase-orders/{id}/cancel', [PurchaseOrderController::class, 'cancel'])
        ->middleware('permission:edit,purchase_order')->name('purchase-orders.cancel');

    /**
     * RECEIVE STOCK — dedicated receive,purchase_order permission so warehouse
     * staff can fulfil POs without gaining create/edit on them.
     */
    Route::post('/purchase-orders/{id}/receive', ReceivePurchaseOrderController::class)
        ->middleware('permission:receive,purchase_order')->name('purchase-orders.receive');
});
