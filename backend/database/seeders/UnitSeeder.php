<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Inventory\Unit;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = [
            ['name' => 'Kilogram', 'symbol' => 'kg', 'type' => 'mass'],
            ['name' => 'Gram', 'symbol' => 'g', 'type' => 'mass'],
            ['name' => 'Litre', 'symbol' => 'L', 'type' => 'volume'],
            ['name' => 'Millilitre', 'symbol' => 'ml', 'type' => 'volume'],
            ['name' => 'Piece', 'symbol' => 'pc', 'type' => 'count'],
            ['name' => 'Box', 'symbol' => 'box', 'type' => 'count'],
            ['name' => 'Set', 'symbol' => 'set', 'type' => 'count'],
            ['name' => 'Meter', 'symbol' => 'm', 'type' => 'length'],
        ];

        foreach ($units as $unit) {
            Unit::firstOrCreate($unit);
        }
    }
}
