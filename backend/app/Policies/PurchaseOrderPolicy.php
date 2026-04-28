<?php

namespace App\Policies;

use App\Models\Auth\User;
use App\Models\Purchase\PurchaseOrder;

class PurchaseOrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view', 'purchase_order');
    }

    public function view(User $user, PurchaseOrder $order): bool
    {
        return $user->hasPermission('view', 'purchase_order');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('create', 'purchase_order');
    }

    public function update(User $user, PurchaseOrder $order): bool
    {
        return $user->hasPermission('edit', 'purchase_order');
    }

    public function submit(User $user, PurchaseOrder $order): bool
    {
        return $user->hasPermission('edit', 'purchase_order');
    }

    /**
     * Confirming a PO is mapped to delete,purchase_order so that by default
     * only Admin (the only role granted that permission in the seeder) can
     * release a PO into the supply chain. Admins can hand it out via the UI.
     */
    public function confirm(User $user, PurchaseOrder $order): bool
    {
        return $user->hasPermission('delete', 'purchase_order');
    }

    public function cancel(User $user, PurchaseOrder $order): bool
    {
        return $user->hasPermission('edit', 'purchase_order');
    }

    public function receive(User $user, PurchaseOrder $order): bool
    {
        return $user->hasPermission('receive', 'purchase_order');
    }
}
