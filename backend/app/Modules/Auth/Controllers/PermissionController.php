<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Auth\Permission;
use App\Modules\Auth\Resources\PermissionResource;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    /**
     * Read-only catalogue of every (action, resource) pair the system knows
     * about. Used by the Settings → Roles edit UI to render the 10×4 grid.
     */
    public function index(): JsonResponse
    {
        $permissions = Permission::query()
            ->orderBy('resource')
            ->orderBy('action')
            ->get();

        return response()->json([
            'data' => PermissionResource::collection($permissions),
        ]);
    }
}
