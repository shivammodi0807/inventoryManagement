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

        $recipients = User::where('is_active', true)
            ->where(function ($query) {
                $query->whereHas('role.permissions', function ($q) {
                    $q->whereIn('action', ['edit', 'manage'])
                      ->where('resource', 'product');
                })->orWhereHas('role', function ($q) {
                    $q->where('name', 'Admin');
                });
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
