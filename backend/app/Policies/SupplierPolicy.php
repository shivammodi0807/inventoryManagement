<?php

namespace App\Policies;

use App\Models\Auth\User;
use App\Models\Supplier\Supplier;

class SupplierPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view', 'supplier');
    }

    public function view(User $user, Supplier $supplier): bool
    {
        return $user->hasPermission('view', 'supplier');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('create', 'supplier');
    }

    public function update(User $user, Supplier $supplier): bool
    {
        return $user->hasPermission('edit', 'supplier');
    }

    /**
     * Deactivating (soft-delete) is restricted by default to roles holding
     * delete,supplier (Admin only by seeder; admins can grant elsewhere).
     */
    public function delete(User $user, Supplier $supplier): bool
    {
        return $user->hasPermission('delete', 'supplier');
    }

    public function linkProduct(User $user, Supplier $supplier): bool
    {
        return $user->hasPermission('edit', 'supplier');
    }

    public function unlinkProduct(User $user, Supplier $supplier): bool
    {
        return $user->hasPermission('edit', 'supplier');
    }

    public function viewPerformance(User $user, Supplier $supplier): bool
    {
        return $user->hasPermission('edit', 'supplier');
    }
}
