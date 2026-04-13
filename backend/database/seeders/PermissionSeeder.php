<?php

namespace Database\Seeders;

use App\Models\Auth\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $resources = ['product', 'category', 'user'];
        $actions = ['create', 'edit', 'delete', 'view'];

        foreach ($resources as $resource) {
            foreach ($actions as $action) {
                Permission::firstOrCreate([
                    'action' => $action,
                    'resource' => $resource
                ]);
            }
        }
    }
}
