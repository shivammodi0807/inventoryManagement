<?php

namespace App\Modules\Sales\Enums;

enum SalesOrderStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::Pending => 'Pending',
            self::Confirmed => 'Confirmed',
            self::Shipped => 'Shipped',
            self::Delivered => 'Delivered',
            self::Cancelled => 'Cancelled',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::Pending => 'gray',
            self::Confirmed => 'blue',
            self::Shipped => 'indigo',
            self::Delivered => 'green',
            self::Cancelled => 'red',
        };
    }

    public function isEditable(): bool
    {
        return $this === self::Pending;
    }

    public function canCancel(): bool
    {
        return in_array($this, [self::Pending, self::Confirmed]);
    }
}
