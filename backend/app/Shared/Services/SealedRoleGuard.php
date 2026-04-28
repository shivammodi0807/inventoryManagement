<?php

namespace App\Shared\Services;

use App\Models\Auth\Role;
use App\Models\Auth\User;

/**
 * Centralised invariants that protect the two roles the app cannot function
 * without:
 *
 *  - Admin:  permissions are sealed (always granted, cannot be narrowed),
 *            cannot be renamed, cannot be deleted, and the system must
 *            always have at least one active Admin user.
 *  - Guest:  cannot be renamed and cannot be deleted (it is the role newly
 *            registered users land in). Its permissions ARE editable so the
 *            admin can decide what a brand-new account is allowed to do.
 *
 * Every mutating role/user controller is expected to call the relevant
 * assertion before persisting. Violations throw an HttpException(422) so the
 * frontend can surface a clean message instead of a generic 500.
 */
class SealedRoleGuard
{
    public const ADMIN = 'Admin';
    public const GUEST = 'Guest';

    /** Roles whose name + existence are immutable. */
    public const SEALED_ROLES = [self::ADMIN, self::GUEST];

    public static function isSealed(Role $role): bool
    {
        return in_array($role->name, self::SEALED_ROLES, true);
    }

    public static function isAdminRole(Role $role): bool
    {
        return $role->name === self::ADMIN;
    }

    public static function isGuestRole(Role $role): bool
    {
        return $role->name === self::GUEST;
    }

    /**
     * Block renaming a sealed role. Description changes are still allowed.
     */
    public static function assertCanRename(Role $role, string $newName): void
    {
        if (self::isSealed($role) && $role->name !== $newName) {
            abort(422, "The {$role->name} role is sealed and cannot be renamed.");
        }
    }

    /**
     * Block deleting a sealed role.
     */
    public static function assertCanDelete(Role $role): void
    {
        if (self::isSealed($role)) {
            abort(422, "The {$role->name} role is sealed and cannot be deleted.");
        }
    }

    /**
     * Block changing Admin's permission set. Guest's permissions remain
     * editable on purpose.
     */
    public static function assertCanUpdatePermissions(Role $role): void
    {
        if (self::isAdminRole($role)) {
            abort(422, 'The Admin role always has every permission and cannot be modified.');
        }
    }

    /**
     * Block demoting the last active Admin. Used when an admin user's
     * role_id is being changed to anything other than the Admin role.
     */
    public static function assertCanChangeRole(User $user, int $newRoleId): void
    {
        $adminRole = Role::where('name', self::ADMIN)->first();
        if (!$adminRole) {
            return;
        }

        // Only matters when the user is currently an Admin moving to non-Admin.
        if ($user->role_id !== $adminRole->id || $newRoleId === $adminRole->id) {
            return;
        }

        if (self::adminCount(excludingUserId: $user->id) === 0) {
            abort(422, 'Cannot demote the last remaining Admin. Promote another user first.');
        }
    }

    /**
     * Block deleting (or deactivating) the last active Admin.
     */
    public static function assertCanDeleteUser(User $user): void
    {
        $adminRole = Role::where('name', self::ADMIN)->first();
        if (!$adminRole || $user->role_id !== $adminRole->id) {
            return;
        }

        if (self::adminCount(excludingUserId: $user->id) === 0) {
            abort(422, 'Cannot delete the last remaining Admin. Promote another user first.');
        }
    }

    /**
     * Block deactivating the last active Admin (is_active = false).
     */
    public static function assertCanDeactivate(User $user): void
    {
        $adminRole = Role::where('name', self::ADMIN)->first();
        if (!$adminRole || $user->role_id !== $adminRole->id) {
            return;
        }

        if (self::adminCount(excludingUserId: $user->id) === 0) {
            abort(422, 'Cannot deactivate the last remaining Admin.');
        }
    }

    /**
     * Count active, non-soft-deleted Admin users, optionally excluding one id
     * (used when the caller is about to mutate that user).
     */
    private static function adminCount(?int $excludingUserId = null): int
    {
        $adminRole = Role::where('name', self::ADMIN)->first();
        if (!$adminRole) {
            return 0;
        }

        return User::query()
            ->where('role_id', $adminRole->id)
            ->where('is_active', true)
            ->when($excludingUserId !== null, fn ($q) => $q->where('id', '!=', $excludingUserId))
            ->count();
    }
}
