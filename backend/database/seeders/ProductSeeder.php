<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Inventory\Product;
use App\Models\Inventory\Category;
use App\Models\Inventory\Unit;
use App\Models\Auth\User;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $category = Category::where('name', 'Smartphones')->first();
        $unit = Unit::where('symbol', 'pc')->first();
        $user = User::first();

        $products = [
            [
                'sku' => 'IPHONE15-BLK',
                'name' => 'iPhone 15 Black 128GB',
                'description' => 'Apple iPhone 15 with 128GB storage',
                'category_id' => $category->id,
                'unit_price' => 799.00,
                'cost_price' => 600.00,
                'unit_id' => $unit->id,
                'reorder_point' => 10,
                'reorder_quantity' => 20,
                'user_id' => $user->id,
            ],
            [
                'sku' => 'S24-ULTRA-GRY',
                'name' => 'Samsung S24 Ultra Grey',
                'description' => 'Samsung Galaxy S24 Ultra with AI features',
                'category_id' => $category->id,
                'unit_price' => 1199.00,
                'cost_price' => 900.00,
                'unit_id' => $unit->id,
                'reorder_point' => 5,
                'reorder_quantity' => 10,
                'user_id' => $user->id,
            ],
        ];

        foreach ($products as $product) {
            Product::firstOrCreate($product);
        }
    }
}
