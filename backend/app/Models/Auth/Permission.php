<?php

namespace App\Models\Auth;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $fillable = ['action', 'resource'];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permission');
    }
}
