<?php

namespace App\Policies;

use App\Models\Auth\User;
use App\Models\Inventory\Product;

class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Product $product): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('manage-inventory');
    }

    public function update(User $user, Product $product): bool
    {
        return $user->hasPermission('manage-inventory');
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->hasPermission('manage-inventory');
    }

    public function adjustStock(User $user, Product $product): bool
    {
        return $user->hasPermission('manage-inventory');
    }

    public function receiveStock(User $user, Product $product): bool
    {
        return $user->hasPermission('manage-inventory');
    }

    public function viewStockHistory(User $user, Product $product): bool
    {
        return true;
    }
}
