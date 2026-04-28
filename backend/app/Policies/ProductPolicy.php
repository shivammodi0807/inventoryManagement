<?php

namespace App\Policies;

use App\Models\Auth\User;
use App\Models\Inventory\Product;

class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view', 'product');
    }

    public function view(User $user, Product $product): bool
    {
        return $user->hasPermission('view', 'product');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('create', 'product');
    }

    public function update(User $user, Product $product): bool
    {
        return $user->hasPermission('edit', 'product');
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->hasPermission('delete', 'product');
    }

    public function adjustStock(User $user, Product $product): bool
    {
        return $user->hasPermission('edit', 'product');
    }

    public function receiveStock(User $user, Product $product): bool
    {
        return $user->hasPermission('edit', 'product');
    }

    public function viewStockHistory(User $user, Product $product): bool
    {
        return $user->hasPermission('view', 'product');
    }
}
