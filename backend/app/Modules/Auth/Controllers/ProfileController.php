<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        // $request->user()->load('role');  // Should already be available or lazy loaded
        return response()->json(new UserResource($request->user()));
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'unique:users,email,' . $request->user()->id],
            'full_name' => ['required', 'string', 'max:255'],
        ]);

        $request->user()->update($validated);

        return response()->json(new UserResource($request->user()));
    }
}
