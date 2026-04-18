<?php

namespace Database\Factories\Inventory;

use App\Models\Inventory\Product;
use App\Models\Inventory\StockLevel;
use App\Models\Inventory\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockLevel>
 */
class StockLevelFactory extends Factory
{
    protected $model = StockLevel::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $current = fake()->numberBetween(0, 500);

        return [
            'product_id' => Product::factory(),
            'warehouse_id' => Warehouse::factory(),
            'total_stock' => $current,
            'stock_reserved' => 0,
            'current_stock' => $current,
            'stock_verified_on' => now(),
        ];
    }
}
