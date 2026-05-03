<?php

use App\Modules\Sales\Controllers\CustomerController;
use App\Modules\Sales\Controllers\InvoiceController;
use App\Modules\Sales\Controllers\SalesOrderController;
use Illuminate\Support\Facades\Route;

Route::prefix('sales')->middleware('auth:sanctum')->group(function () {
    // Customers
    Route::apiResource('customers', CustomerController::class);

    // Sales Orders
    Route::get('orders', [SalesOrderController::class, 'index']);
    Route::post('orders', [SalesOrderController::class, 'store']);
    Route::get('orders/{id}', [SalesOrderController::class, 'show']);
    Route::post('orders/{id}/confirm', [SalesOrderController::class, 'confirm']);
    Route::post('orders/{id}/cancel', [SalesOrderController::class, 'cancel']);

    // Invoices
    Route::post('orders/{orderId}/invoice', [InvoiceController::class, 'generate']);
    Route::get('invoices/{id}/export', [InvoiceController::class, 'export']);
    Route::post('invoices/{id}/payments', [InvoiceController::class, 'recordPayment']);
});
