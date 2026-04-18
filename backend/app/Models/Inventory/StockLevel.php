<?php

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockLevel extends Model
{
    use HasFactory;

    protected $table = 'stock_levels';

    protected $fillable = [
        'product_id',
        'warehouse_id',
        'total_stock',
        'stock_reserved',
        'current_stock',
        'stock_verified_on',
    ];

    protected $casts = [
        'stock_verified_on' => 'datetime',
        'total_stock' => 'integer',
        'stock_reserved' => 'integer',
        'current_stock' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
}
