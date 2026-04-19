<?php

namespace App\Modules\Notification\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowStockNotification extends Notification implements ShouldQueue
{
    use Queueable;

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
        return ['database', 'mail', 'broadcast'];
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
            'priority' => $this->priority(),
            'action_url' => "/dashboard/products/{$this->productId}",
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $priority = $this->priority();
        $subject = $priority === 'critical'
            ? "[Critical] Low stock: {$this->productName}"
            : "Low stock: {$this->productName}";

        return (new MailMessage)
            ->subject($subject)
            ->greeting('Low Stock Alert')
            ->line("{$this->productName} is running low.")
            ->line("Current stock: {$this->currentStock} units.")
            ->line("Reorder point: {$this->reorderPoint} units.")
            ->action('View Product', url("/dashboard/products/{$this->productId}"));
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    private function priority(): string
    {
        return $this->currentStock <= (int) ($this->reorderPoint * 0.5) ? 'critical' : 'warning';
    }
}
