<?php

namespace App\Models\Purchase;

use Illuminate\Database\Eloquent\Model;
use App\Models\Supplier\Supplier;
use App\Models\Auth\User;

class PurchaseOrder extends Model
{
    protected $table = 'purchase_orders';

    protected $fillable = [
        'order_number',
        'supplier_id',
        'status',
        'order_date',
        'exp_delivery',
        'total_amount',
        'description',
        'user_id',
    ];

    protected $casts = [
        'order_date' => 'date',
        'exp_delivery' => 'date',
        'total_amount' => 'decimal:2',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}
