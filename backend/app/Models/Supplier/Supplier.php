<?php

namespace App\Models\Supplier;

use App\Models\Inventory\Product;
use App\Models\Purchase\PurchaseOrder;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;

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

    /**
     * Scope: only active suppliers.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: search by name, contact name, or email (case-insensitive LIKE).
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (empty($term)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
                ->orWhere('contact_name', 'like', "%{$term}%")
                ->orWhere('email', 'like', "%{$term}%");
        });
    }
}
