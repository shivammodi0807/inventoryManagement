<?php

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Model;
use App\Models\Auth\User;

class InventoryLog extends Model
{
    protected $fillable = [
        'product_id',
        'type',
        'quantity_change',
        'quantity_before',
        'quantity_after',
        'notes',
        'user_id',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
