<?php

namespace App\Modules\Sales\Services;

use App\Models\Sales\Invoice;
use App\Models\Sales\SalesOrder;
use App\Modules\Sales\Enums\InvoiceStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InvoiceService
{
    /**
     * Generate an invoice for a confirmed Sales Order.
     */
    public function generateFromOrder(int $orderId): Invoice
    {
        return DB::transaction(function () use ($orderId) {
            $order = SalesOrder::findOrFail($orderId);

            // Check if invoice already exists
            if ($order->invoice) {
                return $order->invoice;
            }

            $invoice = Invoice::create([
                'invoice_number' => $this->generateInvoiceNumber(),
                'sales_order_id' => $order->id,
                'status' => InvoiceStatus::Unpaid->value,
                'due_date' => now()->addDays(15), // Default due in 15 days
                'total_amount' => $order->grand_total,
                'amount_paid' => 0,
                'amount_due' => $order->grand_total,
            ]);

            return $invoice;
        });
    }

    /**
     * Record a payment against an invoice.
     */
    public function recordPayment(int $invoiceId, array $data): Invoice
    {
        return DB::transaction(function () use ($invoiceId, $data) {
            /** @var Invoice $invoice */
            $invoice = Invoice::lockForUpdate()->findOrFail($invoiceId);

            $paymentAmount = (float) $data['amount'];

            $invoice->payments()->create([
                'payment_method' => $data['payment_method'],
                'amount' => $paymentAmount,
                'transaction_id' => $data['transaction_id'] ?? null,
                'payment_date' => $data['payment_date'] ?? now(),
                'notes' => $data['notes'] ?? null,
            ]);

            $invoice->amount_paid = (float)$invoice->amount_paid + $paymentAmount;
            $invoice->amount_due = (float)$invoice->total_amount - (float)$invoice->amount_paid;

            if ($invoice->amount_due <= 0) {
                $invoice->status = InvoiceStatus::Paid->value;
                $invoice->amount_due = 0;
            } elseif ($invoice->amount_paid > 0) {
                $invoice->status = InvoiceStatus::PartiallyPaid->value;
            }

            $invoice->save();

            return $invoice->fresh('payments');
        });
    }

    /**
     * Generate a unique invoice number.
     */
    private function generateInvoiceNumber(): string
    {
        $prefix = 'INV-';
        $number = strtoupper(Str::random(10));
        
        while (Invoice::where('invoice_number', $prefix . $number)->exists()) {
            $number = strtoupper(Str::random(10));
        }

        return $prefix . $number;
    }
}
