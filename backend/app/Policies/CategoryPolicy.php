<?php

namespace App\Policies;

use App\Models\Auth\User;
use App\Models\Inventory\Category;

class CategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view', 'category');
    }

    public function view(User $user, Category $category): bool
    {
        return $user->hasPermission('view', 'category');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('create', 'category');
    }

    public function update(User $user, Category $category): bool
    {
        return $user->hasPermission('edit', 'category');
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->hasPermission('delete', 'category');
    }
}
