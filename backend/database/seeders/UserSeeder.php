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

        User::firstOrCreate(
            ['email' => 'admin@qollab.com'],
            [
                'full_name' => 'System administrator',
                'password' => Hash::make('password'),
                'role_id' => $adminRole->id,
                'is_active' => true,
            ]
        );
    }
}
