<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Auth\Controllers\LoginController;
use App\Modules\Auth\Controllers\LogoutController;
use App\Modules\Auth\Controllers\ProfileController;
use App\Modules\Auth\Controllers\PasswordController;
use App\Modules\Auth\Controllers\UserController;

Route::post('/login', LoginController::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', LogoutController::class);
    
    // User self-management
    Route::get('/user', [ProfileController::class, 'show']);
    Route::put('/user/profile', [ProfileController::class, 'update']);
    Route::put('/user/password', PasswordController::class);

    // Admin user management
    Route::apiResource('users', UserController::class)->middleware('permission:create,user');
});
