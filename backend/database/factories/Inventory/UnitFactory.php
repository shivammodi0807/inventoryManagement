<?php

namespace Database\Factories\Inventory;

use App\Models\Inventory\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Unit>
 */
class UnitFactory extends Factory
{
    protected $model = Unit::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'symbol' => fake()->unique()->lexify('???'),
            'type' => fake()->randomElement(['mass', 'volume', 'count', 'length']),
        ];
    }
}
