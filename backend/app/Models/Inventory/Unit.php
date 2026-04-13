<?php

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    protected $fillable = ['name', 'symbol', 'type'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
