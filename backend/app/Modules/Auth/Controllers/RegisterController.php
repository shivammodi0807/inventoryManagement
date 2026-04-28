<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Modules\Auth\Requests\RegisterRequest;
use App\Modules\Auth\Resources\UserResource;
use App\Shared\Services\SealedRoleGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
    /**
     * Public self-service signup. New accounts are always created in the
     * sealed `Guest` role with email_verified_at = null; users must confirm
     * their email before any `verified` middleware will let them through.
     * Admin user provisioning lives on `POST /api/users` instead.
     */
    public function __invoke(RegisterRequest $request): JsonResponse
    {
        $guestRole = Role::where('name', SealedRoleGuard::GUEST)->firstOrFail();

        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);
        $data['role_id'] = $guestRole->id;
        $data['is_active'] = true;

        $user = User::create($data);
        $user->sendEmailVerificationNotification();

        return response()->json(new UserResource($user->load('role.permissions')), 201);
    }
}
