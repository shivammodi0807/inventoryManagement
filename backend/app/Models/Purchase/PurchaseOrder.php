<?php

namespace App\Models\Purchase;

use App\Models\Auth\User;
use App\Models\Supplier\Supplier;
use App\Modules\PurchaseOrder\Enums\PurchaseOrderStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrder extends Model
{
    use HasFactory, SoftDeletes;

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
        'status' => PurchaseOrderStatus::class,
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

    /**
     * Scope: orders currently in the pipeline (submitted or confirmed).
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->whereIn('status', [
            PurchaseOrderStatus::Submitted->value,
            PurchaseOrderStatus::Confirmed->value,
            PurchaseOrderStatus::PartiallyReceived->value,
        ]);
    }

    /**
     * Auto-generate sequential order_number on create (PO-{year}-{0001}).
     */
    protected static function booted(): void
    {
        static::creating(function (self $order) {
            if (! empty($order->order_number)) {
                return;
            }

            $year = now()->year;
            $last = static::withTrashed()
                ->whereYear('created_at', $year)
                ->orderByDesc('id')
                ->first();

            $next = 1;
            if ($last && preg_match('/(\d+)$/', $last->order_number, $m)) {
                $next = (int) $m[1] + 1;
            }

            $order->order_number = sprintf('PO-%d-%04d', $year, $next);
        });
    }
}
