<?php

namespace App\Modules\PurchaseOrder\Enums;

enum PurchaseOrderStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case Confirmed = 'confirmed';
    case PartiallyReceived = 'partially_received';
    case Received = 'received';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Submitted => 'Submitted',
            self::Confirmed => 'Confirmed',
            self::PartiallyReceived => 'Partially Received',
            self::Received => 'Received',
            self::Cancelled => 'Cancelled',
        };
    }

    /**
     * Can stock be received against a PO in this status?
     */
    public function isReceivable(): bool
    {
        return in_array($this, [self::Confirmed, self::PartiallyReceived], true);
    }

    /**
     * Can the PO be edited in this status?
     */
    public function isEditable(): bool
    {
        return $this === self::Draft;
    }

    /**
     * Can the PO be cancelled from this status?
     */
    public function isCancellable(): bool
    {
        return ! in_array($this, [self::Received, self::Cancelled], true);
    }
}
