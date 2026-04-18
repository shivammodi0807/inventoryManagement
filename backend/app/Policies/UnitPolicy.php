<?php

namespace App\Policies;

use App\Models\Auth\User;
use App\Models\Inventory\Unit;

class UnitPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Unit $unit): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('manage-inventory');
    }

    public function update(User $user, Unit $unit): bool
    {
        return $user->hasPermission('manage-inventory');
    }

    public function delete(User $user, Unit $unit): bool
    {
        return $user->hasPermission('manage-inventory');
    }
}
