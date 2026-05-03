<?php
namespace App\Console\Commands;
use Illuminate\Console\Command;
use App\Models\Auth\User;
use App\Modules\Notification\Notifications\LowStockNotification;

class TriggerTestNotification extends Command
{
    protected $signature = 'test:notification {user_id=1}';
    public function handle()
    {
        $user = User::find($this->argument('user_id'));
        if (!$user) {
            $this->error('User not found');
            return;
        }
        $this->info('Triggering notification for ' . $user->email);
        $user->notifyNow(new LowStockNotification(101, 'Test Product', 5, 10));
        $this->info('Notification sent successfully');
    }
}
