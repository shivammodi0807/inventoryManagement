<?php

namespace App\Modules\Analytics\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Analytics\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private ReportService $service) {}

    /**
     * Get inventory valuation report data.
     */
    public function inventoryValuation(): JsonResponse
    {
        return response()->json($this->service->getInventoryValuationData());
    }

    /**
     * Get sales performance report data.
     */
    public function salesPerformance(Request $request): JsonResponse
    {
        $period = $request->query('period', 'month');
        $from = $request->query('from');
        $to = $request->query('to');
        
        return response()->json($this->service->getSalesPerformanceData($from, $to, $period));
    }

    /**
     * Get low stock report data.
     */
    public function lowStockReport(): JsonResponse
    {
        return response()->json($this->service->getLowStockData());
    }

    /**
     * Export Inventory Valuation to PDF.
     */
    public function exportInventoryValuation()
    {
        $data = $this->service->getInventoryValuationData();
        $pdf = Pdf::loadView('analytics::inventory_valuation_pdf', $data);
        
        return $pdf->download("inventory-valuation-" . now()->format('Y-m-d') . ".pdf");
    }

    /**
     * Export Sales Summary to PDF.
     */
    public function exportSalesPerformance(Request $request)
    {
        $period = $request->query('period', 'month');
        $from = $request->query('from');
        $to = $request->query('to');
        
        $data = $this->service->getSalesPerformanceData($from, $to, $period);
        $pdf = Pdf::loadView('analytics::sales_summary_pdf', $data);
        
        return $pdf->download("sales-summary-" . ($from ? "{$from}-to-{$to}" : $period) . "-" . now()->format('Y-m-d') . ".pdf");
    }
    
    /**
     * Get recent inventory logs for auditing.
     */
    public function auditLogs(Request $request): JsonResponse
    {
        $from = $request->query('from');
        $to = $request->query('to');
        return response()->json($this->service->getInventoryLogs($from, $to));
    }

    /**
     * Get supplier performance metrics.
     */
    public function supplierPerformance(): JsonResponse
    {
        return response()->json($this->service->getSupplierPerformance());
    }

    /**
     * Export Low Stock report to PDF.
     */
    public function exportLowStock()
    {
        $data = $this->service->getLowStockData();
        $pdf = Pdf::loadView('analytics::low_stock_pdf', ['data' => $data]);
        
        return $pdf->download("low-stock-report-" . now()->format('Y-m-d') . ".pdf");
    }

    /**
     * Export Audit Logs to PDF.
     */
    public function exportAuditLogs(Request $request)
    {
        $from = $request->query('from');
        $to = $request->query('to');
        
        $logs = $this->service->getInventoryLogs($from, $to);
        $pdf = Pdf::loadView('analytics::audit_logs_pdf', ['logs' => $logs]);
        
        return $pdf->download("inventory-audit-log-" . ($from ? "{$from}-to-{$to}" : now()->format('Y-m-d')) . ".pdf");
    }

    /**
     * Export Supplier Performance to PDF.
     */
    public function exportSupplierPerformance()
    {
        $data = $this->service->getSupplierPerformance();
        
        // Convert arrays to objects for the view if necessary
        $pdf = Pdf::loadView('analytics::supplier_performance_pdf', json_decode(json_encode($data), true));
        
        return $pdf->download("supplier-performance-" . now()->format('Y-m-d') . ".pdf");
    }

    /**
     * Get inventory forecast data.
     */
    public function inventoryForecast(): JsonResponse
    {
        return response()->json($this->service->getInventoryForecast());
    }
}
