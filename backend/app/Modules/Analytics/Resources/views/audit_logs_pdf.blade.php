<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Inventory Audit Log</title>
    <style>
        body { font-family: 'Inter', 'Helvetica', sans-serif; color: #1f2937; margin: 0; padding: 0; }
        .report-box { max-width: 850px; margin: auto; padding: 30px; }
        .header { border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: 800; color: #111827; }
        .meta { text-align: right; font-size: 12px; color: #6b7280; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed; }
        .table th { background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; padding: 10px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; color: #374151; }
        .table td { padding: 10px; border-bottom: 1px solid #f3f4f6; font-size: 11px; word-wrap: break-word; }
        .text-right { text-align: right; }
        .badge { padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; text-transform: uppercase; }
        .receipt { background-color: #d1fae5; color: #065f46; }
        .sale { background-color: #dbeafe; color: #1e40af; }
        .adjustment { background-color: #fef3c7; color: #92400e; }
        .damage { background-color: #fee2e2; color: #991b1b; }
        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="report-box">
        <table style="width: 100%; margin-bottom: 20px;">
            <tr>
                <td style="vertical-align: top;">
                    <div class="title">Inventory Audit Log</div>
                    <div style="color: #6366f1; font-weight: 600; margin-top: 5px;">Compliance & History Record</div>
                </td>
                <td class="meta">
                    <strong>Qollab Inventory Management</strong><br>
                    Date: {{ date('M d, Y') }}<br>
                    Time: {{ date('H:i') }}<br>
                    Ref: #AUD-{{ date('Ymd') }}
                </td>
            </tr>
        </table>

        <table class="table">
            <thead>
                <tr>
                    <th style="width: 15%;">Date</th>
                    <th style="width: 20%;">Product</th>
                    <th style="width: 12%;">Action</th>
                    <th style="width: 10%;" class="text-right">Change</th>
                    <th style="width: 10%;" class="text-right">Balance</th>
                    <th style="width: 15%;">User</th>
                    <th style="width: 18%;">Reason/Notes</th>
                </tr>
            </thead>
            <tbody>
                @foreach($logs as $log)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($log->created_at)->format('Y-m-d H:i') }}</td>
                    <td>{{ $log->product_name }}</td>
                    <td>
                        <span class="badge {{ $log->type }}">
                            {{ $log->type }}
                        </span>
                    </td>
                    <td class="text-right">
                        {{ $log->quantity_change > 0 ? '+' : '' }}{{ number_format($log->quantity_change) }}
                    </td>
                    <td class="text-right">{{ number_format($log->new_stock) }}</td>
                    <td>{{ $log->user_name ?: 'System' }}</td>
                    <td><small>{{ $log->reason ?: '-' }}</small></td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="footer">
            Official Document - Unauthorized alteration is prohibited.<br>
            &copy; {{ date('Y') }} Qollab Systems. All rights reserved.
        </div>
    </div>
</body>
</html>
