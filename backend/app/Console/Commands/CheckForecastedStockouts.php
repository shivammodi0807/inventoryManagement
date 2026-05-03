<?php

namespace App\Console\Commands;

use App\Models\Auth\User;
use App\Modules\Analytics\Services\ReportService;
use App\Modules\Notification\Notifications\ForecastedStockoutNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

class CheckForecastedStockouts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inventory:check-forecasts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scan for items predicted to run out soon and notify the team.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Calculating inventory forecasts...');
        
        $reportService = new ReportService();
        $forecast = $reportService->getInventoryForecast();

        // Filter items that are expected to run out within 7 days
        $criticalItems = array_filter($forecast, function($item) {
            return $item['status'] === 'critical';
        });

        if (empty($criticalItems)) {
            $this->info('No critical stock-outs predicted.');
            return;
        }

        $this->info('Found ' . count($criticalItems) . ' critical items. Sending notifications...');

        // Notify Admins and Managers
        $recipients = User::where('is_active', true)
            ->whereHas('role', function ($q) {
                $q->whereIn('name', ['Admin', 'Manager']);
            })->get();

        if ($recipients->isEmpty()) {
            $this->warn('No recipients found to notify.');
            return;
        }

        foreach ($criticalItems as $item) {
            Notification::send($recipients, new ForecastedStockoutNotification(
                productId: $item['id'],
                productName: $item['name'],
                daysRemaining: $item['days_remaining'],
                estimatedDate: $item['estimated_stock_out']
            ));
        }

        $this->info('Done!');
    }
}
