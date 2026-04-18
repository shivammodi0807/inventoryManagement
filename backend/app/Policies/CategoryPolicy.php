<?php

namespace App\Policies;

use App\Models\Auth\User;
use App\Models\Inventory\Category;

class CategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Category $category): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('manage-inventory');
    }

    public function update(User $user, Category $category): bool
    {
        return $user->hasPermission('manage-inventory');
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->hasPermission('manage-inventory');
    }
}
