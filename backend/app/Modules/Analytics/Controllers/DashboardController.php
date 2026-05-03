<?php

namespace App\Modules\Analytics\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Analytics\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    private DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function stats(): JsonResponse
    {
        // Cache the dashboard stats for 60 minutes.
        // It will be manually busted when stock or PO changes.
        $stats = Cache::remember('dashboard_stats', 60 * 60, function () {
            return $this->dashboardService->getDashboardStats();
        });

        return response()->json($stats);
    }
}
