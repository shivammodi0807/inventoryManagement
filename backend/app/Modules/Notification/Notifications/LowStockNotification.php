<?php

namespace App\Modules\Notification\Notifications;

use Illuminate\Notifications\Notification;

class LowStockNotification extends Notification
{
    public function __construct(
        public int $productId,
        public string $productName,
        public int $currentStock,
        public int $reorderPoint,
    ) {}

    /**
     * The channels the notification is delivered on.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * The payload persisted to the notifications table.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'low_stock',
            'title' => "Low Stock Alert: {$this->productName}",
            'message' => "Stock is at {$this->currentStock} units (reorder point: {$this->reorderPoint}).",
            'product_id' => $this->productId,
            'current_stock' => $this->currentStock,
            'reorder_point' => $this->reorderPoint,
            'priority' => $this->currentStock <= (int) ($this->reorderPoint * 0.5) ? 'critical' : 'warning',
            'action_url' => "/dashboard/products/{$this->productId}",
        ];
    }
}
