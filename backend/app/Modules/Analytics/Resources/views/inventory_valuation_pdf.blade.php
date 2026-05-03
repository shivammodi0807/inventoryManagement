<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Inventory Valuation Report</title>
    <style>
        body { font-family: 'Inter', 'Helvetica', sans-serif; color: #1f2937; margin: 0; padding: 0; }
        .report-box { max-width: 800px; margin: auto; padding: 40px; }
        .header { border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 28px; font-weight: 800; color: #111827; }
        .meta { text-align: right; font-size: 14px; color: #6b7280; }
        .summary-grid { display: table; width: 100%; margin-bottom: 40px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
        .summary-col { display: table-cell; width: 25%; text-align: center; }
        .label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6b7280; margin-bottom: 5px; }
        .value { font-size: 18px; font-weight: 700; color: #111827; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th { background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; padding: 12px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #374151; }
        .table td { padding: 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
        .text-right { text-align: right; }
        .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="report-box">
        <table style="width: 100%; margin-bottom: 30px;">
            <tr>
                <td style="vertical-align: top;">
                    <div class="title">Inventory Valuation</div>
                    <div style="color: #10b981; font-weight: 600; margin-top: 5px;">Asset Health Report</div>
                </td>
                <td class="meta">
                    <strong>Qollab Inventory Management</strong><br>
                    Generated: {{ $generated_at }}<br>
                    Reference: #VAL-{{ date('Ymd-Hi') }}
                </td>
            </tr>
        </table>

        <div class="summary-grid">
            <div class="summary-col">
                <div class="label">Total Stock</div>
                <div class="value">{{ number_format($totals['stock']) }}</div>
            </div>
            <div class="summary-col">
                <div class="label">Cost Value</div>
                <div class="value">${{ number_format($totals['cost_value'], 2) }}</div>
            </div>
            <div class="summary-col">
                <div class="label">Retail Value</div>
                <div class="value">${{ number_format($totals['retail_value'], 2) }}</div>
            </div>
            <div class="summary-col">
                <div class="label">Est. Profit</div>
                <div class="value" style="color: #10b981;">${{ number_format($totals['potential_profit'], 2) }}</div>
            </div>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th class="text-right">Stock Level</th>
                    <th class="text-right">Cost Value</th>
                    <th class="text-right">Retail Value</th>
                </tr>
            </thead>
            <tbody>
                @foreach($breakdown as $item)
                <tr>
                    <td><strong>{{ $item->category_name ?: 'Uncategorized' }}</strong></td>
                    <td class="text-right">{{ number_format($item->total_stock) }}</td>
                    <td class="text-right">${{ number_format($item->total_cost_value, 2) }}</td>
                    <td class="text-right">${{ number_format($item->total_retail_value, 2) }}</td>
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
