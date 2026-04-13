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
        $roles = [
            ['name' => 'Admin', 'description' => 'Full access'],
            ['name' => 'Manager', 'description' => 'Manage inventory'],
            ['name' => 'Staff', 'description' => 'Limited access'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }
    }
}
