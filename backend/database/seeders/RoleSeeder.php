<?php

namespace Database\Seeders;

use App\Models\Auth\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin and Guest are sealed roles (see SealedRoleGuard).
        // Manager and Staff are seeded as editable examples.
        $roles = [
            ['name' => 'Admin', 'description' => 'Full access. Sealed role.'],
            ['name' => 'Guest', 'description' => 'Default role for newly registered users. Permissions managed by admin.'],
            ['name' => 'Manager', 'description' => 'Manage inventory, suppliers and purchase orders.'],
            ['name' => 'Staff', 'description' => 'Read-only access to operational data.'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }
    }
}
