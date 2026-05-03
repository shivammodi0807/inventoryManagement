<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        body { font-family: 'Inter', 'Helvetica', sans-serif; color: #1f2937; margin: 0; padding: 0; }
        .invoice-box { max-width: 800px; margin: auto; padding: 40px; }
        .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.025em; }
        .company-info { text-align: right; font-size: 14px; line-height: 1.5; color: #4b5563; }
        .bill-grid { display: table; width: 100%; margin-bottom: 40px; }
        .bill-col { display: table-cell; width: 50%; vertical-align: top; }
        .label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; display: block; }
        .info-text { font-size: 15px; line-height: 1.6; }
        .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
        .table th { background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; padding: 12px 15px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #374151; }
        .table td { padding: 15px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
        .text-right { text-align: right; }
        .total-container { margin-top: 40px; display: table; width: 100%; }
        .total-spacer { display: table-cell; width: 60%; }
        .total-box { display: table-cell; width: 40%; }
        .total-row { display: table; width: 100%; margin-bottom: 10px; }
        .total-label { display: table-cell; font-size: 14px; color: #4b5563; }
        .total-value { display: table-cell; text-align: right; font-size: 14px; font-weight: 500; }
        .grand-total-row { border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 15px; }
        .grand-total-label { font-size: 18px; font-weight: 800; color: #111827; }
        .grand-total-value { font-size: 18px; font-weight: 800; color: #3b82f6; text-align: right; }
        .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 20px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .badge-paid { background-color: #d1fae5; color: #065f46; }
        .badge-unpaid { background-color: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <div class="invoice-box">
        <table style="width: 100%; margin-bottom: 40px;">
            <tr>
                <td style="vertical-align: top;">
                    <div class="title">INVOICE</div>
                    <div style="margin-top: 10px;">
                        <span class="badge {{ $invoice->status === 'paid' ? 'badge-paid' : 'badge-unpaid' }}">
                            {{ $invoice->status }}
                        </span>
                    </div>
                </td>
                <td class="company-info">
                    <strong style="color: #111827; font-size: 18px;">Qollab Inventory</strong><br>
                    123 Business Avenue, Suite 100<br>
                    Tech City, TC 54321<br>
                    support@qollab.com
                </td>
            </tr>
        </table>

        <div class="bill-grid">
            <div class="bill-col">
                <span class="label">Billed To</span>
                <div class="info-text">
                    <strong>{{ $invoice->salesOrder->customer->name }}</strong><br>
                    {{ $invoice->salesOrder->customer->address }}<br>
                    Phone: {{ $invoice->salesOrder->customer->phone }}
                </div>
            </div>
            <div class="bill-col text-right">
                <span class="label">Invoice Details</span>
                <div class="info-text">
                    <strong>Number:</strong> {{ $invoice->invoice_number }}<br>
                    <strong>Date:</strong> {{ $invoice->created_at->format('M d, Y') }}<br>
                    <strong>Order Ref:</strong> {{ $invoice->salesOrder->order_number }}
                </div>
            </div>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-right">Qty</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->salesOrder->items as $item)
                <tr>
                    <td>
                        <strong>{{ $item->product->name }}</strong><br>
                        <span style="font-size: 11px; color: #6b7280;">SKU: {{ $item->product->sku }}</span>
                    </td>
                    <td class="text-right">{{ $item->quantity }}</td>
                    <td class="text-right">${{ number_format($item->unit_price, 2) }}</td>
                    <td class="text-right">${{ number_format($item->subtotal, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="total-container">
            <div class="total-spacer"></div>
            <div class="total-box">
                <div class="total-row">
                    <div class="total-label">Subtotal</div>
                    <div class="total-value">${{ number_format($invoice->salesOrder->total_amount, 2) }}</div>
                </div>
                @if($invoice->salesOrder->discount_amount > 0)
                <div class="total-row">
                    <div class="total-label">Discount</div>
                    <div class="total-value">-${{ number_format($invoice->salesOrder->discount_amount, 2) }}</div>
                </div>
                @endif
                @if($invoice->salesOrder->tax_amount > 0)
                <div class="total-row">
                    <div class="total-label">Tax</div>
                    <div class="total-value">+${{ number_format($invoice->salesOrder->tax_amount, 2) }}</div>
                </div>
                @endif
                <div class="total-row grand-total-row">
                    <div class="total-label grand-total-label">Total</div>
                    <div class="total-value grand-total-value">${{ number_format($invoice->total_amount, 2) }}</div>
                </div>
                <div class="total-row" style="margin-top: 10px;">
                    <div class="total-label">Amount Paid</div>
                    <div class="total-value">${{ number_format($invoice->amount_paid, 2) }}</div>
                </div>
                <div class="total-row">
                    <div class="total-label"><strong>Balance Due</strong></div>
                    <div class="total-value" style="color: {{ $invoice->amount_due > 0 ? '#b91c1c' : '#059669' }}">
                        <strong>${{ number_format($invoice->amount_due, 2) }}</strong>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            Thank you for your business!<br>
            If you have any questions about this invoice, please contact our billing department.
        </div>
    </div>
</body>
</html>
