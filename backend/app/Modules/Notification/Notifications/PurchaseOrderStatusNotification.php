<?php

namespace App\Modules\Notification\Notifications;

use Illuminate\Notifications\Notification;

class PurchaseOrderStatusNotification extends Notification
{
    public function __construct(
        public int $orderId,
        public string $orderNumber,
        public string $status,
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
            'type' => 'purchase_order_status',
            'title' => "Purchase Order {$this->orderNumber} updated",
            'message' => "Status changed to {$this->status}.",
            'order_id' => $this->orderId,
            'order_number' => $this->orderNumber,
            'status' => $this->status,
            'priority' => 'info',
            'action_url' => "/dashboard/purchase-orders/{$this->orderId}",
        ];
    }
}
