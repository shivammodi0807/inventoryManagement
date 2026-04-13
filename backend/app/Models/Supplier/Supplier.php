<?php

namespace App\Models\Supplier;

use Illuminate\Database\Eloquent\Model;
use App\Models\Inventory\Product;
use App\Models\Purchase\PurchaseOrder;

class Supplier extends Model
{
    protected $fillable = [
        'name',
        'contact_name',
        'email',
        'phone',
        'address',
        'city',
        'country',
        'payment_terms',
        'rating',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'rating' => 'decimal:1',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_supplier')
            ->withPivot(['supplier_sku', 'cost_price', 'est_delivery_days', 'is_preferred', 'min_order_qty'])
            ->withTimestamps();
    }

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}
