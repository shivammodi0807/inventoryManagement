<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Inventory\Warehouse;

class WarehouseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $warehouses = [
            ['name' => 'Main Warehouse', 'location' => 'Building A, North Wing', 'is_active' => true],
            ['name' => 'Secondary Storage', 'location' => 'Building C, Basement', 'is_active' => true],
            ['name' => 'Quarantine Area', 'location' => 'Building B, Section 4', 'is_active' => true],
        ];

        foreach ($warehouses as $warehouse) {
            Warehouse::firstOrCreate($warehouse);
        }
    }
}
