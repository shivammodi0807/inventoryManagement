<?php

namespace Database\Factories\Purchase;

use App\Models\Auth\User;
use App\Models\Purchase\PurchaseOrder;
use App\Models\Supplier\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PurchaseOrder>
 */
class PurchaseOrderFactory extends Factory
{
    protected $model = PurchaseOrder::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_number' => strtoupper(fake()->unique()->bothify('PO-####-???')),
            'supplier_id' => Supplier::factory(),
            'status' => 'draft',
            'order_date' => now()->subDays(10)->toDateString(),
            'exp_delivery' => now()->addDays(5)->toDateString(),
            'total_amount' => fake()->randomFloat(2, 100, 10000),
            'description' => fake()->sentence(),
            'user_id' => User::factory(),
        ];
    }
}
