<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Purchase Order {{ $order->order_number }}</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 14px;
            color: #333;
            line-height: 1.6;
        }
        .header {
            margin-bottom: 30px;
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 20px;
        }
        .company-info {
            float: left;
            width: 50%;
        }
        .order-info {
            float: right;
            width: 50%;
            text-align: right;
        }
        .section {
            margin-bottom: 30px;
            clear: both;
        }
        .supplier-info {
            float: left;
            width: 50%;
        }
        .shipping-info {
            float: right;
            width: 50%;
        }
        h1 {
            color: #4f46e5;
            margin-top: 0;
            font-size: 28px;
        }
        h2 {
            font-size: 18px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            background-color: #f9fafb;
            text-align: left;
            padding: 12px;
            border-bottom: 2px solid #eee;
            font-weight: bold;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #eee;
        }
        .text-right {
            text-align: right;
        }
        .totals {
            float: right;
            width: 300px;
        }
        .total-row {
            padding: 8px 0;
        }
        .total-label {
            float: left;
            font-weight: bold;
        }
        .total-value {
            float: right;
        }
        .grand-total {
            border-top: 2px solid #4f46e5;
            margin-top: 10px;
            padding-top: 10px;
            font-size: 18px;
            font-weight: bold;
            color: #4f46e5;
        }
        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }
        .badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            text-transform: uppercase;
        }
        .badge-draft { background-color: #e5e7eb; color: #374151; }
        .badge-submitted { background-color: #dbeafe; color: #1e40af; }
        .badge-confirmed { background-color: #dcfce7; color: #166534; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <h1>QOLLAB</h1>
            <p>
                <strong>Qollab Inventory Systems</strong><br>
                123 Business Avenue<br>
                Tech Park, NY 10001<br>
                contact@qollab.com
            </p>
        </div>
        <div class="order-info">
            <h2 style="border: none;">PURCHASE ORDER</h2>
            <p>
                <strong>PO Number:</strong> {{ $order->order_number }}<br>
                <strong>Date:</strong> {{ $order->order_date->format('M d, Y') }}<br>
                <strong>Status:</strong> <span class="badge badge-{{ $order->status->value }}">{{ $order->status->label() }}</span>
            </p>
        </div>
    </div>

    <div class="section">
        <div class="supplier-info">
            <h2>Supplier</h2>
            <p>
                <strong>{{ $order->supplier->name }}</strong><br>
                {{ $order->supplier->email }}<br>
                {{ $order->supplier->phone }}<br>
                @if($order->supplier->address)
                    {{ $order->supplier->address }}
                @endif
            </p>
        </div>
        <div class="shipping-info">
            <h2>Ship To</h2>
            <p>
                <strong>Qollab Main Warehouse</strong><br>
                456 Logistics Way<br>
                Brooklyn, NY 11201<br>
                Attn: Receiving Department
            </p>
        </div>
    </div>

    <div class="section" style="clear: both; padding-top: 20px;">
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-right">Qty Ordered</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr>
                    <td>
                        <strong>{{ $item->product->name }}</strong><br>
                        <span style="font-size: 12px; color: #666;">SKU: {{ $item->product->sku }}</span>
                    </td>
                    <td class="text-right">{{ $item->qty_ordered }}</td>
                    <td class="text-right">${{ number_format($item->cost_price, 2) }}</td>
                    <td class="text-right">${{ number_format($item->cost_price * $item->qty_ordered, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="totals">
            <div class="total-row">
                <span class="total-label">Subtotal</span>
                <span class="total-value">${{ number_format($order->total_amount, 2) }}</span>
            </div>
            <div class="total-row">
                <span class="total-label">Tax (0%)</span>
                <span class="total-value">$0.00</span>
            </div>
            <div class="total-row grand-total">
                <span class="total-label">Total Amount</span>
                <span class="total-value">${{ number_format($order->total_amount, 2) }}</span>
            </div>
        </div>
    </div>

    @if($order->description)
    <div class="section" style="clear: both; margin-top: 40px;">
        <h2>Notes</h2>
        <p style="white-space: pre-wrap;">{{ $order->description }}</p>
    </div>
    @endif

    <div class="footer">
        Generated by Qollab Inventory Management System on {{ now()->format('Y-m-d H:i:s') }}
    </div>
</body>
</html>
