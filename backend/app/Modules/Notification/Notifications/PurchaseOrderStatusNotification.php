<?php

namespace App\Modules\Notification\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PurchaseOrderStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

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
        return ['database', 'mail', 'broadcast'];
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

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Purchase Order {$this->orderNumber} updated")
            ->greeting("PO {$this->orderNumber}")
            ->line("The status of this purchase order is now: {$this->status}.")
            ->action('View Purchase Order', url("/dashboard/purchase-orders/{$this->orderId}"));
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
