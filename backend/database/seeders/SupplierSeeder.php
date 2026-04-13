<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Supplier\Supplier;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $suppliers = [
            [
                'name' => 'TechCorp Solutions',
                'contact_name' => 'John Doe',
                'email' => 'contact@techcorp.com',
                'phone' => '1234567890',
                'address' => '123 Silicon Valley',
                'city' => 'San Jose',
                'country' => 'USA',
                'payment_terms' => 'Net 30',
                'rating' => 4.5,
                'is_active' => true,
            ],
            [
                'name' => 'Global Logistics Inc',
                'contact_name' => 'Jane Smith',
                'email' => 'info@globallogistics.com',
                'phone' => '0987654321',
                'address' => '456 Port Road',
                'city' => 'Singapore',
                'country' => 'Singapore',
                'payment_terms' => 'Net 15',
                'rating' => 4.2,
                'is_active' => true,
            ],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::firstOrCreate($supplier);
        }
    }
}
