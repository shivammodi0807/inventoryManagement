<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Auth\Controllers\EmailVerificationController;
use App\Modules\Auth\Controllers\ForgotPasswordController;
use App\Modules\Auth\Controllers\LoginController;
use App\Modules\Auth\Controllers\LogoutController;
use App\Modules\Auth\Controllers\PermissionController;
use App\Modules\Auth\Controllers\ProfileController;
use App\Modules\Auth\Controllers\PasswordController;
use App\Modules\Auth\Controllers\RegisterController;
use App\Modules\Auth\Controllers\ResetPasswordController;
use App\Modules\Auth\Controllers\RoleController;
use App\Modules\Auth\Controllers\UserController;

Route::post('/login', LoginController::class);

// Public self-service signup. Always creates a Guest user and triggers an
// email-verification message. Throttled to deter mass account creation.
Route::post('/register', RegisterController::class)
    ->middleware('throttle:6,1');

// Public password-reset flow.
Route::post('/password/forgot', ForgotPasswordController::class)
    ->middleware('throttle:6,1');
Route::post('/password/reset', ResetPasswordController::class)
    ->middleware('throttle:6,1');

// Email verification consume endpoint. The signed middleware validates the
// expires + signature query params built by VerifyEmailNotification. Must be
// public (the user clicking the link is not necessarily logged in) and named
// so URL::temporarySignedRoute('verification.verify', ...) resolves it.
Route::post('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', LogoutController::class);

    // User self-management — always available to authenticated users (even
    // unverified ones), so they can update their email and request a new
    // verification mail without being locked out.
    Route::get('/user', [ProfileController::class, 'show']);
    Route::put('/user/profile', [ProfileController::class, 'update']);
    Route::put('/user/password', PasswordController::class);

    // Resend verification email for the current user.
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:6,1');

    // Everything below requires a verified email AND the relevant permission.
    Route::middleware('verified')->group(function () {
        // Permission catalogue (read-only). Used by the role-edit grid.
        Route::get('/permissions', [PermissionController::class, 'index'])
            ->middleware('permission:view,role');

        // Role CRUD + permission grid sync. Sealed-role invariants are
        // enforced inside the controller via SealedRoleGuard.
        Route::get('/roles', [RoleController::class, 'index'])
            ->middleware('permission:view,role');
        Route::post('/roles', [RoleController::class, 'store'])
            ->middleware('permission:create,role');
        Route::get('/roles/{role}', [RoleController::class, 'show'])
            ->middleware('permission:view,role');
        Route::match(['put', 'patch'], '/roles/{role}', [RoleController::class, 'update'])
            ->middleware('permission:edit,role');
        Route::delete('/roles/{role}', [RoleController::class, 'destroy'])
            ->middleware('permission:delete,role');
        Route::put('/roles/{role}/permissions', [RoleController::class, 'updatePermissions'])
            ->middleware('permission:edit,role');

        // Admin user management with per-action permissions
        Route::get('/users', [UserController::class, 'index'])
            ->middleware('permission:view,user');
        Route::post('/users', [UserController::class, 'store'])
            ->middleware('permission:create,user');
        Route::get('/users/{user}', [UserController::class, 'show'])
            ->middleware('permission:view,user');
        Route::match(['put', 'patch'], '/users/{user}', [UserController::class, 'update'])
            ->middleware('permission:edit,user');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])
            ->middleware('permission:delete,user');
    });
});
