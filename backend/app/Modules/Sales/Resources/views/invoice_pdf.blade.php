<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #333; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .title { font-size: 28px; font-weight: bold; color: #444; }
        .info { margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { border: 1px solid #eee; padding: 10px; text-align: left; }
        .table th { background-color: #f9f9f9; }
        .total-box { margin-top: 20px; text-align: right; }
        .total-box div { margin-bottom: 5px; }
        .grand-total { font-size: 18px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="invoice-box">
        <div class="header">
            <div class="title">INVOICE</div>
            <div>
                <strong>Qollab Inventory</strong><br>
                Invoice #: {{ $invoice->invoice_number }}<br>
                Date: {{ $invoice->created_at->format('Y-m-d') }}<br>
                Due Date: {{ $invoice->due_date->format('Y-m-d') }}
            </div>
        </div>

        <div class="info">
            <strong>Bill To:</strong><br>
            {{ $invoice->salesOrder->customer->name }}<br>
            {{ $invoice->salesOrder->customer->address }}<br>
            Phone: {{ $invoice->salesOrder->customer->phone }}
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->salesOrder->items as $item)
                <tr>
                    <td>{{ $item->product->name }}</td>
                    <td>{{ $item->quantity }}</td>
                    <td>${{ number_format($item->unit_price, 2) }}</td>
                    <td>${{ number_format($item->subtotal, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="total-box">
            <div>Subtotal: ${{ number_format($invoice->salesOrder->total_amount, 2) }}</div>
            <div>Discount: -${{ number_format($invoice->salesOrder->discount_amount, 2) }}</div>
            <div>Tax: +${{ number_format($invoice->salesOrder->tax_amount, 2) }}</div>
            <div class="grand-total">Total: ${{ number_format($invoice->total_amount, 2) }}</div>
            <hr>
            <div>Amount Paid: ${{ number_format($invoice->amount_paid, 2) }}</div>
            <div><strong>Amount Due: ${{ number_format($invoice->amount_due, 2) }}</strong></div>
        </div>
    </div>
</body>
</html>
