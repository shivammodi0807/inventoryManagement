<?php

namespace App\Modules\Notification\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OverstockNotification extends Notification implements ShouldQueue
{
    use Queueable;

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
        return ['database', 'mail', 'broadcast'];
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

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Overstock warning: {$this->productName}")
            ->greeting('Overstock Warning')
            ->line("{$this->productName} has exceeded its overstock threshold.")
            ->line("Current stock: {$this->currentStock} units.")
            ->line("Threshold: {$this->threshold} units.")
            ->action('View Product', url("/dashboard/products/{$this->productId}"));
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
