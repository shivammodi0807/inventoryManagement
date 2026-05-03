<?php

namespace App\Modules\Notification\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class ForecastedStockoutNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $productId,
        public string $productName,
        public int $daysRemaining,
        public string $estimatedDate
    ) {}

    /**
     * The channels the notification is delivered on.
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * The payload persisted to the notifications table.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'forecasted_stockout',
            'title' => "Upcoming Stock-out: {$this->productName}",
            'message' => "This product is predicted to run out in {$this->daysRemaining} days (Est. {$this->estimatedDate}).",
            'product_id' => $this->productId,
            'days_remaining' => $this->daysRemaining,
            'estimated_date' => $this->estimatedDate,
            'priority' => 'warning',
            'action_url' => "/dashboard/reports/forecast",
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
