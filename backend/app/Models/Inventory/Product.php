<?php

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Model;
use App\Models\Auth\User;
use App\Models\Supplier\Supplier;
use App\Models\Purchase\PurchaseOrderItem;
use App\Models\Analytics\Prediction;

class Product extends Model
{
    protected $fillable = [
        'sku',
        'name',
        'description',
        'category_id',
        'unit_price',
        'cost_price',
        'unit_id',
        'reorder_point',
        'reorder_quantity',
        'lead_time_days',
        'attributes',
        'image_url',
        'is_active',
        'user_id',
    ];

    protected $casts = [
        'attributes' => 'json',
        'is_active' => 'boolean',
        'unit_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function stockLevels()
    {
        return $this->hasMany(StockLevel::class);
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class);
    }

    public function suppliers()
    {
        return $this->belongsToMany(Supplier::class, 'product_supplier')
            ->withPivot(['supplier_sku', 'cost_price', 'est_delivery_days', 'is_preferred', 'min_order_qty'])
            ->withTimestamps();
    }

    public function purchaseOrderItems()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function predictions()
    {
        return $this->hasMany(Prediction::class);
    }
}
