<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Low Stock Report</title>
    <style>
        body { font-family: 'Inter', 'Helvetica', sans-serif; color: #1f2937; margin: 0; padding: 0; }
        .report-box { max-width: 800px; margin: auto; padding: 40px; }
        .header { border-bottom: 2px solid #ef4444; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 28px; font-weight: 800; color: #111827; }
        .meta { text-align: right; font-size: 14px; color: #6b7280; }
        .summary-grid { display: table; width: 100%; margin-bottom: 40px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
        .summary-col { display: table-cell; width: 33%; text-align: center; }
        .label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6b7280; margin-bottom: 5px; }
        .value { font-size: 18px; font-weight: 700; color: #111827; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th { background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; padding: 12px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #374151; }
        .table td { padding: 12px; border-bottom: 1px solid #f3f4f6; font-size: 12px; }
        .text-right { text-align: right; }
        .critical { color: #ef4444; font-weight: 700; }
        .warning { color: #f59e0b; font-weight: 700; }
        .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="report-box">
        <table style="width: 100%; margin-bottom: 30px;">
            <tr>
                <td style="vertical-align: top;">
                    <div class="title">Low Stock Report</div>
                    <div style="color: #ef4444; font-weight: 600; margin-top: 5px;">Procurement Alert</div>
                </td>
                <td class="meta">
                    <strong>Qollab Inventory Management</strong><br>
                    Generated: {{ $data['generated_at'] }}<br>
                    Reference: #STK-{{ date('Ymd-Hi') }}
                </td>
            </tr>
        </table>

        <div class="summary-grid">
            <div class="summary-col">
                <div class="label">Critical Items</div>
                <div class="value critical">{{ $data['summary']['total_critical'] }}</div>
            </div>
            <div class="summary-col">
                <div class="label">Low Stock Items</div>
                <div class="value warning">{{ $data['summary']['total_low'] }}</div>
            </div>
            <div class="summary-col">
                <div class="label">Total Monitored</div>
                <div class="value">{{ $data['summary']['total_products'] }}</div>
            </div>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>Product / SKU</th>
                    <th>Category</th>
                    <th class="text-right">Stock</th>
                    <th class="text-right">Reorder</th>
                    <th class="text-right">Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['items'] as $item)
                <tr>
                    <td>
                        <strong>{{ $item->name }}</strong><br>
                        <small style="color: #6b7280;">{{ $item->sku }}</small>
                    </td>
                    <td>{{ $item->category_name ?: 'N/A' }}</td>
                    <td class="text-right">{{ number_format($item->total_stock) }}</td>
                    <td class="text-right">{{ number_format($item->reorder_point) }}</td>
                    <td class="text-right">
                        @if($item->total_stock == 0)
                            <span class="critical">Out of Stock</span>
                        @elseif($item->total_stock <= ($item->reorder_point / 2))
                            <span class="critical">Critical</span>
                        @else
                            <span class="warning">Low</span>
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="footer">
            Confidential - Procurement Planning Use Only<br>
            &copy; {{ date('Y') }} Qollab Systems. All rights reserved.
        </div>
    </div>
</body>
</html>
