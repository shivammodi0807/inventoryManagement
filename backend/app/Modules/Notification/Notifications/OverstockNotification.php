<?php

namespace App\Modules\Notification\Notifications;

use Illuminate\Notifications\Notification;

class OverstockNotification extends Notification
{
    public function __construct(
        public int $productId,
        public string $productName,
        public int $currentStock,
        public int $threshold,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'overstock',
            'title' => "Overstock Warning: {$this->productName}",
            'message' => "Stock is at {$this->currentStock} units (threshold: {$this->threshold}).",
            'product_id' => $this->productId,
            'current_stock' => $this->currentStock,
            'threshold' => $this->threshold,
            'priority' => 'warning',
            'action_url' => "/dashboard/products/{$this->productId}",
        ];
    }
}
