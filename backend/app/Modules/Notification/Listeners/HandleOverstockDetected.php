<?php

namespace App\Modules\Notification\Listeners;

use App\Models\Auth\User;
use App\Models\Inventory\Product;
use App\Modules\Inventory\Events\OverstockDetected;
use App\Modules\Notification\Notifications\OverstockNotification;
use Illuminate\Support\Facades\Notification;

class HandleOverstockDetected
{
    public function handle(OverstockDetected $event): void
    {
        $product = Product::find($event->productId);

        if (! $product) {
            return;
        }

        $recipients = User::whereHas('role', function ($q) {
            $q->whereIn('name', ['Admin', 'Manager']);
        })->get();

        if ($recipients->isEmpty()) {
            return;
        }

        Notification::send($recipients, new OverstockNotification(
            productId: $event->productId,
            productName: $product->name,
            currentStock: $event->currentStock,
            threshold: $event->threshold,
        ));
    }
}
