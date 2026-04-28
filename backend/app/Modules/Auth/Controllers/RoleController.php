<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Auth\Role;
use App\Modules\Auth\Requests\RolePermissionsRequest;
use App\Modules\Auth\Requests\RoleStoreRequest;
use App\Modules\Auth\Requests\RoleUpdateRequest;
use App\Modules\Auth\Resources\RoleResource;
use App\Shared\Services\SealedRoleGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class RoleController extends Controller
{
    /**
     * List every role with its user count. Sealed flags are surfaced so the
     * UI can disable rename/delete affordances. Permissions are NOT loaded
     * here — fetch them via show() to avoid blowing up the payload.
     */
    public function index(): JsonResponse
    {
        $roles = Role::query()
            ->withCount('users')
            ->orderBy('id')
            ->get();

        return response()->json([
            'data' => RoleResource::collection($roles),
        ]);
    }

    /**
     * Single role with its full permission set. Used by the role-edit page
     * to seed the 10×4 checkbox grid.
     */
    public function show(Role $role): JsonResponse
    {
        $role->load('permissions');
        $role->loadCount('users');

        return response()->json(new RoleResource($role));
    }

    /**
     * Create a new (custom) role. Optionally accepts permission_ids to seed
     * the role with permissions in a single request.
     */
    public function store(RoleStoreRequest $request): JsonResponse
    {
        $data = $request->validated();
        $permissionIds = $data['permission_ids'] ?? [];
        unset($data['permission_ids']);

        $role = Role::create($data);

        if (!empty($permissionIds)) {
            $role->permissions()->sync($permissionIds);
        }

        $role->load('permissions');
        $role->loadCount('users');

        return response()->json(new RoleResource($role), 201);
    }

    /**
     * Rename / re-describe a role. Sealed roles cannot be renamed (description
     * remains editable so admins can document them).
     */
    public function update(RoleUpdateRequest $request, Role $role): JsonResponse
    {
        $data = $request->validated();

        if (array_key_exists('name', $data)) {
            SealedRoleGuard::assertCanRename($role, $data['name']);
        }

        $role->update($data);
        $role->loadCount('users');

        return response()->json(new RoleResource($role));
    }

    /**
     * Delete a role. Blocked for sealed roles and for roles still assigned
     * to one or more users (avoids orphaning user.role_id FK).
     */
    public function destroy(Role $role): Response
    {
        SealedRoleGuard::assertCanDelete($role);

        if ($role->users()->exists()) {
            abort(422, 'This role is still assigned to one or more users. Reassign them before deleting.');
        }

        $role->permissions()->detach();
        $role->delete();

        return response()->noContent();
    }

    /**
     * Replace a role's permission set wholesale. Payload is the canonical
     * source of truth for the 10×4 grid: missing ids are revoked, present
     * ids are granted. Admin's set is sealed and cannot be narrowed.
     */
    public function updatePermissions(RolePermissionsRequest $request, Role $role): JsonResponse
    {
        SealedRoleGuard::assertCanUpdatePermissions($role);

        $ids = $request->validated()['permission_ids'];
        $role->permissions()->sync($ids);

        $role->load('permissions');
        $role->loadCount('users');

        return response()->json(new RoleResource($role));
    }
}
