<?php

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    protected $fillable = ['name', 'location', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function stockLevels()
    {
        return $this->hasMany(StockLevel::class);
    }
}
