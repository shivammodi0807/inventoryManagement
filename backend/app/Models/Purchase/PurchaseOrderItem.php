<?php

namespace App\Models\Purchase;

use Illuminate\Database\Eloquent\Model;
use App\Models\Inventory\Product;

class PurchaseOrderItem extends Model
{
    protected $table = 'purchase_order_items';

    protected $fillable = [
        'purchase_order_id',
        'product_id',
        'qty_ordered',
        'qty_received',
        'cost_price',
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'qty_ordered' => 'integer',
        'qty_received' => 'integer',
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
