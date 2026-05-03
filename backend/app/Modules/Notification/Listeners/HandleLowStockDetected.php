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
        $product = Product::with(['suppliers' => function ($q) {
            $q->wherePivot('is_preferred', true);
        }])->find($event->productId);

        if (! $product) {
            return;
        }

        // Recipients are users who have permission to edit products or are Admins
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
            // Fallback: If no one has specific 'manage products' permission, 
            // notifying everyone with 'view products' might be too much, 
            // but we definitely want someone to see it.
            return;
        }

        $canAutoPo = false;
        $suggestedData = [];

        if ($product->auto_po_generation && $product->suppliers->isNotEmpty()) {
            $supplier = $product->suppliers->first();
            $canAutoPo = true;
            $suggestedData = [
                'supplier_id' => $supplier->id,
                'supplier_name' => $supplier->name,
                'quantity' => $product->reorder_quantity ?: 1,
                'cost_price' => $supplier->pivot->cost_price ?: $product->cost_price,
            ];
        }

        Notification::send($recipients, new LowStockNotification(
            productId: $event->productId,
            productName: $product->name,
            currentStock: $event->currentStock,
            reorderPoint: $event->reorderPoint,
            canAutoPo: $canAutoPo,
            suggestedData: $suggestedData
        ));
    }
}
