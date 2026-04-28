<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Auth\User;
use App\Models\Auth\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = Role::where('name', 'Admin')->first();
        $managerRole = Role::where('name', 'Manager')->first();
        $staffRole = Role::where('name', 'Staff')->first();

        // Seeded fixture users skip email verification so they can log in
        // immediately after `php artisan migrate:fresh --seed`.
        User::firstOrCreate(
            ['email' => 'admin@qollab.com'],
            [
                'full_name' => 'System administrator',
                'password' => Hash::make('password'),
                'role_id' => $adminRole->id,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        if ($managerRole) {
            User::firstOrCreate(
                ['email' => 'manager@qollab.com'],
                [
                    'full_name' => 'Demo manager',
                    'password' => Hash::make('password'),
                    'role_id' => $managerRole->id,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );
        }

        if ($staffRole) {
            User::firstOrCreate(
                ['email' => 'staff@qollab.com'],
                [
                    'full_name' => 'Demo staff',
                    'password' => Hash::make('password'),
                    'role_id' => $staffRole->id,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
