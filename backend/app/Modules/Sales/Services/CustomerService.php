<?php

namespace App\Modules\Sales\Services;

use App\Models\Sales\Customer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CustomerService
{
    public function getCustomers(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Customer::query();

        if (! empty($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('email', 'like', "%{$filters['search']}%")
                  ->orWhere('phone', 'like', "%{$filters['search']}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        return $query->latest()->paginate($perPage);
    }

    public function createCustomer(array $data): Customer
    {
        return Customer::create($data);
    }

    public function updateCustomer(int $id, array $data): Customer
    {
        $customer = Customer::findOrFail($id);
        $customer->update($data);
        return $customer;
    }

    public function deleteCustomer(int $id): bool
    {
        $customer = Customer::findOrFail($id);
        return $customer->delete();
    }
}
