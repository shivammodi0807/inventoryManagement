<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Auth\User;
use App\Modules\Auth\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        // Admin only can see this (covered by permission middleware in route)
        $users = User::with('role')->paginate(15);
        return response()->json(UserResource::collection($users)->response()->getData(true));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'unique:users'],
            'password' => ['required', Password::defaults()],
            'full_name' => ['required', 'string', 'max:255'],
            'role_id' => ['required', 'exists:roles,id'],
            'is_active' => ['boolean']
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['is_active'] = $validated['is_active'] ?? true;

        $user = User::create($validated);

        return response()->json(new UserResource($user), 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json(new UserResource($user));
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['email', 'unique:users,email,' . $user->id],
            'password' => ['sometimes', Password::defaults()],
            'full_name' => ['string', 'max:255'],
            'role_id' => ['exists:roles,id'],
            'is_active' => ['boolean']
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json(new UserResource($user));
    }

    public function destroy(User $user): JsonResponse
    {
        // Typically we don't delete users, we deactivate them, but this is standard CRUD
        $user->delete();
        return response()->json(null, 204);
    }
}
