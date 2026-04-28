<?php

namespace Database\Seeders;

use App\Models\Auth\Permission;
use App\Models\Auth\Role;
use App\Models\Auth\RolePermission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin gets every permission. The SealedRoleGuard prevents this from
        // being narrowed at runtime.
        $this->syncRole('Admin', Permission::all());

        // Guest is the auto-assigned role for newly-registered users. It ships
        // empty by design; admins grant it whatever they want signed-up users
        // to see before being promoted to a real role. The Account page is
        // always accessible regardless of permissions.
        $this->syncRole('Guest', collect());

        // Manager: full control over operational data, no user/role admin.
        // Also receives stock so they can close out POs end-to-end.
        $this->syncRole('Manager', Permission::query()
            ->where(function ($q) {
                $q->whereIn('action', ['view', 'create', 'edit'])
                    ->whereIn('resource', [
                        'product', 'category', 'unit', 'supplier',
                        'purchase_order', 'warehouse', 'notification', 'report',
                    ]);
            })
            ->orWhere(function ($q) {
                $q->where('action', 'receive')->where('resource', 'purchase_order');
            })
            ->get());

        // Staff: read-only across operational data, plus the dedicated
        // receive-stock permission so warehouse staff can fulfil POs without
        // gaining create/edit access to them.
        $this->syncRole('Staff', Permission::query()
            ->where(function ($q) {
                $q->where('action', 'view')
                    ->whereIn('resource', [
                        'product', 'category', 'unit', 'supplier',
                        'purchase_order', 'warehouse', 'notification',
                    ]);
            })
            ->orWhere(function ($q) {
                $q->where('action', 'receive')->where('resource', 'purchase_order');
            })
            ->get());
    }

    /**
     * Idempotent sync of a role's permissions. Inserts missing rows; existing
     * rows are left untouched so re-seeding does not bump timestamps.
     */
    private function syncRole(string $roleName, iterable $permissions): void
    {
        $role = Role::where('name', $roleName)->first();
        if (!$role) {
            return;
        }

        foreach ($permissions as $permission) {
            RolePermission::updateOrInsert([
                'role_id' => $role->id,
                'permission_id' => $permission->id,
            ]);
        }
    }
}
