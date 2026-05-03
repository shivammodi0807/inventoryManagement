<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Sales Performance Report</title>
    <style>
        body { font-family: 'Inter', 'Helvetica', sans-serif; color: #1f2937; margin: 0; padding: 0; }
        .report-box { max-width: 800px; margin: auto; padding: 40px; }
        .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 28px; font-weight: 800; color: #111827; }
        .meta { text-align: right; font-size: 14px; color: #6b7280; }
        .summary-grid { display: table; width: 100%; margin-bottom: 40px; background-color: #f8fafc; border-radius: 8px; padding: 20px; }
        .summary-col { display: table-cell; width: 33%; text-align: center; }
        .label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6b7280; margin-bottom: 5px; }
        .value { font-size: 20px; font-weight: 700; color: #1e40af; }
        .section-title { font-size: 16px; font-weight: 700; color: #374151; margin: 30px 0 15px; text-transform: uppercase; letter-spacing: 0.05em; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #475569; }
        .table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .text-right { text-align: right; }
        .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="report-box">
        <table style="width: 100%; margin-bottom: 30px;">
            <tr>
                <td style="vertical-align: top;">
                    <div class="title">Sales Performance</div>
                    <div style="color: #3b82f6; font-weight: 600; margin-top: 5px;">Period: {{ ucfirst($period) }} Analysis</div>
                </td>
                <td class="meta">
                    <strong>Qollab Inventory Management</strong><br>
                    Generated: {{ date('Y-m-d H:i') }}<br>
                    Range: {{ now()->startOf($period)->format('M d') }} - {{ now()->format('M d, Y') }}
                </td>
            </tr>
        </table>

        <div class="summary-grid">
            <div class="summary-col">
                <div class="label">Total Revenue</div>
                <div class="value">${{ number_format($summary['total_revenue'], 2) }}</div>
            </div>
            <div class="summary-col">
                <div class="label">Total Orders</div>
                <div class="value">{{ number_format($summary['total_orders']) }}</div>
            </div>
            <div class="summary-col">
                <div class="label">Avg Order Value</div>
                <div class="value">${{ number_format($summary['avg_order_value'], 2) }}</div>
            </div>
        </div>

        <div class="section-title">Top Performing Products</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th class="text-right">Units Sold</th>
                    <th class="text-right">Revenue</th>
                </tr>
            </thead>
            <tbody>
                @foreach($top_products as $product)
                <tr>
                    <td><strong>{{ $product->name }}</strong></td>
                    <td><code>{{ $product->sku }}</code></td>
                    <td class="text-right">{{ number_format($product->units_sold) }}</td>
                    <td class="text-right">${{ number_format($product->total_revenue, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="section-title">Daily Sales Trend</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th class="text-right">Orders</th>
                    <th class="text-right">Net Sales</th>
                    <th class="text-right">Revenue</th>
                </tr>
            </thead>
            <tbody>
                @foreach($daily_sales as $day)
                <tr>
                    <td>{{ date('M d, Y', strtotime($day->date)) }}</td>
                    <td class="text-right">{{ $day->order_count }}</td>
                    <td class="text-right">${{ number_format($day->net_sales, 2) }}</td>
                    <td class="text-right">${{ number_format($day->revenue, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="footer">
            Confidential - Internal Use Only<br>
            &copy; {{ date('Y') }} Qollab Systems. All rights reserved.
        </div>
    </div>
</body>
</html>
