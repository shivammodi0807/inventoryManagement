<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Analytics\Controllers\DashboardController;
use App\Modules\Analytics\Controllers\ReportController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    
    // Reports
    Route::get('/reports/inventory-valuation', [ReportController::class, 'inventoryValuation']);
    Route::get('/reports/sales-performance', [ReportController::class, 'salesPerformance']);
    Route::get('/reports/low-stock', [ReportController::class, 'lowStockReport']);
    Route::get('/reports/audit-logs', [ReportController::class, 'auditLogs']);
    Route::get('/reports/supplier-performance', [ReportController::class, 'supplierPerformance']);
    
    // Exports
    Route::get('/reports/export/inventory-valuation', [ReportController::class, 'exportInventoryValuation']);
    Route::get('/reports/export/sales-performance', [ReportController::class, 'exportSalesPerformance']);
    Route::get('/reports/export/low-stock', [ReportController::class, 'exportLowStock']);
    Route::get('/reports/export/audit-logs', [ReportController::class, 'exportAuditLogs']);
    Route::get('/reports/export/supplier-performance', [ReportController::class, 'exportSupplierPerformance']);
});
