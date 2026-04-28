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
        // Fixed permission catalogue. New (action, resource) pairs are only added
        // here in code because route middleware checks against this list.
        $resources = [
            'user',
            'role',
            'product',
            'category',
            'unit',
            'supplier',
            'purchase_order',
            'warehouse',
            'notification',
            'report',
        ];
        $actions = ['view', 'create', 'edit', 'delete'];

        foreach ($resources as $resource) {
            foreach ($actions as $action) {
                Permission::firstOrCreate([
                    'action' => $action,
                    'resource' => $resource
                ]);
            }
        }

        // Out-of-matrix permission: receiving stock against a confirmed PO is
        // a distinct operation from generic edit (warehouse staff need it
        // without being able to create/cancel POs).
        Permission::firstOrCreate(['action' => 'receive', 'resource' => 'purchase_order']);
    }
}
