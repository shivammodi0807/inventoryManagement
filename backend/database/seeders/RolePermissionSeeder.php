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
        $admin = Role::where('name', 'Admin')->first();
        $permissions = Permission::all();

        foreach ($permissions as $permission) {
            RolePermission::updateOrInsert([
                'role_id' => $admin->id,
                'permission_id' => $permission->id
            ]);
        }

        // Manager gets limited permissions
        $manager = Role::where('name', 'Manager')->first();

        $managerPermissions = Permission::whereIn('action', ['view', 'edit'])->get();

        foreach ($managerPermissions as $permission) {
            RolePermission::updateOrInsert([
                'role_id' => $manager->id,
                'permission_id' => $permission->id
            ]);
        }
    }
}
