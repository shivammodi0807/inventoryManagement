<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Analytics\Controllers\DashboardController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
});
