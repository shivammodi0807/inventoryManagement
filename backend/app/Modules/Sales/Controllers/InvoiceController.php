<?php

namespace App\Modules\Sales\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Sales\Services\InvoiceService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InvoiceController extends Controller
{
    public function __construct(private InvoiceService $service) {}

    /**
     * Generate an invoice for a specific Sales Order.
     */
    public function generate(int $orderId): JsonResponse
    {
        $invoice = $this->service->generateFromOrder($orderId);
        return response()->json($invoice);
    }

    /**
     * Record a payment against an invoice.
     */
    public function recordPayment(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'payment_method' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'transaction_id' => 'nullable|string',
            'payment_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $invoice = $this->service->recordPayment($id, $validated);
        return response()->json($invoice);
    }

    /**
     * Export invoice to PDF.
     */
    public function export(int $id)
    {
        $invoice = \App\Models\Sales\Invoice::with([
            'salesOrder.customer', 
            'salesOrder.items.product', 
            'payments'
        ])->findOrFail($id);
        
        $pdf = Pdf::loadView('sales::invoice_pdf', ['invoice' => $invoice]);
        
        return $pdf->download("INV-{$invoice->invoice_number}.pdf");
    }
}
