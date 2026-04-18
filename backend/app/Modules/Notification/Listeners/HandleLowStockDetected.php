<?php

namespace App\Modules\Notification\Listeners;

use App\Models\Auth\User;
use App\Models\Inventory\Product;
use App\Modules\Inventory\Events\LowStockDetected;
use App\Modules\Notification\Notifications\LowStockNotification;
use Illuminate\Support\Facades\Notification;

class HandleLowStockDetected
{
    public function handle(LowStockDetected $event): void
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

        Notification::send($recipients, new LowStockNotification(
            productId: $event->productId,
            productName: $product->name,
            currentStock: $event->currentStock,
            reorderPoint: $event->reorderPoint,
        ));
    }
}
