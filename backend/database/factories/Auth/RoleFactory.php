<?php

namespace Database\Factories\Auth;

use App\Models\Auth\Permission;
use App\Models\Auth\Role;
use Database\Seeders\PermissionSeeder;
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

    /**
     * Admin: every permission in the catalogue. Mirrors the production
     * RolePermissionSeeder so feature tests that build roles via the factory
     * (rather than seeding) get a faithful permission set.
     */
    public function admin(): self
    {
        return $this->state(fn () => ['name' => 'Admin', 'description' => 'Full access'])
            ->afterCreating(function (Role $role) {
                $this->ensurePermissionsSeeded();
                $role->permissions()->sync(Permission::query()->pluck('id'));
            });
    }

    /**
     * Manager: full operational CRUD (no user/role admin) plus receive,po.
     */
    public function manager(): self
    {
        return $this->state(fn () => ['name' => 'Manager', 'description' => 'Manage inventory'])
            ->afterCreating(function (Role $role) {
                $this->ensurePermissionsSeeded();
                $ids = Permission::query()
                    ->where(function ($q) {
                        $q->whereIn('action', ['view', 'create', 'edit'])
                            ->whereIn('resource', [
                                'product', 'category', 'unit', 'supplier',
                                'purchase_order', 'warehouse', 'notification', 'report',
                            ]);
                    })
                    ->orWhere(function ($q) {
                        $q->where('action', 'receive')->where('resource', 'purchase_order');
                    })
                    ->pluck('id');
                $role->permissions()->sync($ids);
            });
    }

    /**
     * Staff: read-only operational data plus the dedicated receive,po grant.
     */
    public function staff(): self
    {
        return $this->state(fn () => ['name' => 'Staff', 'description' => 'Limited access'])
            ->afterCreating(function (Role $role) {
                $this->ensurePermissionsSeeded();
                $ids = Permission::query()
                    ->where(function ($q) {
                        $q->where('action', 'view')
                            ->whereIn('resource', [
                                'product', 'category', 'unit', 'supplier',
                                'purchase_order', 'warehouse', 'notification',
                            ]);
                    })
                    ->orWhere(function ($q) {
                        $q->where('action', 'receive')->where('resource', 'purchase_order');
                    })
                    ->pluck('id');
                $role->permissions()->sync($ids);
            });
    }

    /**
     * Tests sometimes don't seed the permission catalogue explicitly. Make
     * sure the 41 (action, resource) pairs exist before we try to attach.
     */
    private function ensurePermissionsSeeded(): void
    {
        if (Permission::query()->doesntExist()) {
            (new PermissionSeeder())->run();
        }
    }
}
