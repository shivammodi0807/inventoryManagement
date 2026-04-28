<?php

namespace App\Policies;

use App\Models\Auth\User;
use App\Models\Inventory\Unit;

class UnitPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view', 'unit');
    }

    public function view(User $user, Unit $unit): bool
    {
        return $user->hasPermission('view', 'unit');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('create', 'unit');
    }

    public function update(User $user, Unit $unit): bool
    {
        return $user->hasPermission('edit', 'unit');
    }

    public function delete(User $user, Unit $unit): bool
    {
        return $user->hasPermission('delete', 'unit');
    }
}
