<?php

namespace App\Modules\Analytics\Listeners;

use Illuminate\Support\Facades\Cache;

class BustDashboardCache
{
    public function handle($event): void
    {
        Cache::forget('dashboard_stats');
    }
}
