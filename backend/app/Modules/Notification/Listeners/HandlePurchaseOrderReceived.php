<?php

namespace App\Modules\Notification\Listeners;

use App\Models\Purchase\PurchaseOrder;
use App\Modules\Notification\Notifications\PurchaseOrderStatusNotification;
use App\Modules\PurchaseOrder\Events\PurchaseOrderReceived;

class HandlePurchaseOrderReceived
{
    public function handle(PurchaseOrderReceived $event): void
    {
        $order = PurchaseOrder::with('user')->find($event->orderId);

        if (! $order || ! $order->user) {
            return;
        }

        $order->user->notify(new PurchaseOrderStatusNotification(
            orderId: $order->id,
            orderNumber: (string) $order->order_number,
            status: $order->status?->value ?? 'unknown',
        ));
    }
}
