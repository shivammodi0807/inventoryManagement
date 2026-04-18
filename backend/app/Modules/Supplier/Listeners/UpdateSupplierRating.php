<?php

namespace App\Modules\Supplier\Listeners;

use App\Models\Purchase\PurchaseOrder;
use App\Modules\PurchaseOrder\Enums\PurchaseOrderStatus;
use App\Modules\PurchaseOrder\Events\PurchaseOrderReceived;

/**
 * Recompute a supplier's delivery rating after a PO is received.
 *
 * Rating = (on-time fully-received orders / fully-received orders) * 5, rounded to 1 decimal.
 * "On-time" = updated_at (last touch on received order) <= exp_delivery.
 */
class UpdateSupplierRating
{
    public function handle(PurchaseOrderReceived $event): void
    {
        $order = PurchaseOrder::with('supplier')->find($event->orderId);

        if (! $order || ! $order->supplier) {
            return;
        }

        $supplier = $order->supplier;

        $total = $supplier->purchaseOrders()
            ->whereIn('status', [
                PurchaseOrderStatus::Received->value,
                PurchaseOrderStatus::PartiallyReceived->value,
            ])
            ->count();

        if ($total === 0) {
            return;
        }

        $onTime = $supplier->purchaseOrders()
            ->where('status', PurchaseOrderStatus::Received->value)
            ->whereColumn('updated_at', '<=', 'exp_delivery')
            ->count();

        $supplier->update([
            'rating' => round(($onTime / $total) * 5, 1),
        ]);
    }
}
