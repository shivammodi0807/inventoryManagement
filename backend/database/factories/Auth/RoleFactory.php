<?php

namespace Database\Factories\Auth;

use App\Models\Auth\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Role>
 */
class RoleFactory extends Factory
{
    protected $model = Role::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'description' => fake()->sentence(),
        ];
    }

    public function admin(): self
    {
        return $this->state(fn () => ['name' => 'Admin', 'description' => 'Full access']);
    }

    public function manager(): self
    {
        return $this->state(fn () => ['name' => 'Manager', 'description' => 'Manage inventory']);
    }

    public function staff(): self
    {
        return $this->state(fn () => ['name' => 'Staff', 'description' => 'Limited access']);
    }
}
