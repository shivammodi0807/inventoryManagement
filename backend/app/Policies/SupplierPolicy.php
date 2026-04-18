<?php

namespace App\Policies;

use App\Models\Auth\User;
use App\Models\Supplier\Supplier;

class SupplierPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Supplier $supplier): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('manage-suppliers');
    }

    public function update(User $user, Supplier $supplier): bool
    {
        return $user->hasPermission('manage-suppliers');
    }

    /**
     * Deactivating (soft-delete) is restricted to admins per the supplier spec.
     */
    public function delete(User $user, Supplier $supplier): bool
    {
        return $user->hasPermission('admin');
    }

    public function linkProduct(User $user, Supplier $supplier): bool
    {
        return $user->hasPermission('manage-suppliers');
    }

    public function unlinkProduct(User $user, Supplier $supplier): bool
    {
        return $user->hasPermission('manage-suppliers');
    }

    public function viewPerformance(User $user, Supplier $supplier): bool
    {
        return $user->hasPermission('manage-suppliers');
    }
}
