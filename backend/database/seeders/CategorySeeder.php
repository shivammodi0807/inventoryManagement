<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Inventory\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $electronics = Category::firstOrCreate([
            'name' => 'Electronics',
            'description' => 'Electronic devices and accessories',
        ]);

        Category::firstOrCreate([
            'name' => 'Smartphones',
            'description' => 'Mobile phones',
            'parent_id' => $electronics->id,
        ]);

        Category::firstOrCreate([
            'name' => 'Laptops',
            'description' => 'Portable computers',
            'parent_id' => $electronics->id,
        ]);

        $furniture = Category::firstOrCreate([
            'name' => 'Furniture',
            'description' => 'Office and home furniture',
        ]);

        Category::firstOrCreate([
            'name' => 'Chairs',
            'description' => 'Various types of chairs',
            'parent_id' => $furniture->id,
        ]);
    }
}
