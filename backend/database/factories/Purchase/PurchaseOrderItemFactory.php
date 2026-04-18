<?php

namespace Database\Factories\Purchase;

use App\Models\Inventory\Product;
use App\Models\Purchase\PurchaseOrder;
use App\Models\Purchase\PurchaseOrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PurchaseOrderItem>
 */
class PurchaseOrderItemFactory extends Factory
{
    protected $model = PurchaseOrderItem::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'purchase_order_id' => PurchaseOrder::factory(),
            'product_id' => Product::factory(),
            'qty_ordered' => fake()->numberBetween(1, 100),
            'qty_received' => 0,
            'cost_price' => fake()->randomFloat(2, 1, 100),
        ];
    }
}
