<?php

namespace App\Models\Auth;

use Illuminate\Database\Eloquent\Relations\Pivot;

class RolePermission extends Pivot
{
    protected $table = 'role_permission';
}
