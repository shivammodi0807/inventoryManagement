<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Supplier Performance Report</title>
    <style>
        body { font-family: 'Inter', 'Helvetica', sans-serif; color: #1f2937; margin: 0; padding: 0; }
        .report-box { max-width: 800px; margin: auto; padding: 40px; }
        .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
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
        .rating { color: #f59e0b; font-weight: 700; }
        .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="report-box">
        <table style="width: 100%; margin-bottom: 30px;">
            <tr>
                <td style="vertical-align: top;">
                    <div class="title">Supplier Performance</div>
                    <div style="color: #3b82f6; font-weight: 600; margin-top: 5px;">Vendor Analytics Report</div>
                </td>
                <td class="meta">
                    <strong>Qollab Inventory Management</strong><br>
                    Generated: {{ date('M d, Y') }}<br>
                    Reference: #VND-{{ date('Ymd') }}
                </td>
            </tr>
        </table>

        <div class="summary-grid">
            <div class="summary-col">
                <div class="label">Avg Reliability</div>
                <div class="value">{{ number_format($summary['avg_reliability'], 1) }}%</div>
            </div>
            <div class="summary-col">
                <div class="label">Avg Lead Time</div>
                <div class="value">{{ number_format($summary['avg_lead_time'], 1) }} Days</div>
            </div>
            <div class="summary-col">
                <div class="label">Total Vendors</div>
                <div class="value">{{ $summary['total_vendors'] }}</div>
            </div>
            <div class="summary-col">
                <div class="label">Top Vendor</div>
                <div class="value" style="font-size: 14px;">{{ $summary['top_vendor']->name ?? 'N/A' }}</div>
            </div>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>Vendor Name</th>
                    <th class="text-right">On-Time Rate</th>
                    <th class="text-right">Avg Lead Time</th>
                    <th class="text-right">Total Spend</th>
                    <th class="text-right">Rating</th>
                </tr>
            </thead>
            <tbody>
                @foreach($suppliers as $supplier)
                <tr>
                    <td><strong>{{ $supplier->name }}</strong></td>
                    <td class="text-right">{{ number_format($supplier->on_time_rate, 1) }}%</td>
                    <td class="text-right">{{ number_format($supplier->avg_lead_time, 1) }} Days</td>
                    <td class="text-right">${{ number_format($supplier->total_spend, 2) }}</td>
                    <td class="text-right rating">{{ number_format($supplier->rating, 1) }} ★</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="footer">
            Confidential - Strategic Sourcing Use Only<br>
            &copy; {{ date('Y') }} Qollab Systems. All rights reserved.
        </div>
    </div>
</body>
</html>
