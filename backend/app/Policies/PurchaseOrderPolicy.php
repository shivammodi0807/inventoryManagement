<?php

namespace App\Policies;

use App\Models\Auth\User;
use App\Models\Purchase\PurchaseOrder;

class PurchaseOrderPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, PurchaseOrder $order): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('manage-purchase-orders');
    }

    public function update(User $user, PurchaseOrder $order): bool
    {
        return $user->hasPermission('manage-purchase-orders');
    }

    public function submit(User $user, PurchaseOrder $order): bool
    {
        return $user->hasPermission('manage-purchase-orders');
    }

    public function confirm(User $user, PurchaseOrder $order): bool
    {
        return $user->hasPermission('admin');
    }

    public function cancel(User $user, PurchaseOrder $order): bool
    {
        return $user->hasPermission('manage-purchase-orders');
    }

    public function receive(User $user, PurchaseOrder $order): bool
    {
        return $user->hasPermission('receive-stock');
    }
}
