<?php

namespace App\Models\Inventory;

use App\Models\Analytics\Prediction;
use App\Models\Auth\User;
use App\Models\Purchase\PurchaseOrderItem;
use App\Models\Supplier\Supplier;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

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

    /**
     * Scope: only active products.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: products whose current stock is at or below their reorder point.
     */
    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereHas('stockLevels', function (Builder $q) {
            $q->whereRaw('stock_levels.current_stock <= products.reorder_point');
        });
    }

    /**
     * Scope: search by name or SKU (case-insensitive LIKE).
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (empty($term)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
                ->orWhere('sku', 'like', "%{$term}%");
        });
    }

    /**
     * Accessor: total available stock across all warehouses.
     */
    public function getTotalStockAttribute(): int
    {
        return (int) $this->stockLevels->sum('current_stock');
    }

    /**
     * Accessor: derived stock status label.
     */
    public function getStockStatusAttribute(): string
    {
        $available = $this->total_stock;
        $reorder = (int) $this->reorder_point;

        return match (true) {
            $available <= $reorder * 0.5 => 'critical',
            $available <= $reorder => 'low',
            $available > $reorder * 3 => 'overstock',
            default => 'normal',
        };
    }

    /**
     * Accessor: get full URL for image.
     */
    public function getImageUrlAttribute($value): ?string
    {
        if (!$value) {
            return null;
        }

        if (str_starts_with($value, 'http')) {
            return $value;
        }

        return asset('storage/' . $value);
    }
}
