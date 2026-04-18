<?php

namespace App\Models\Auth;

use App\Models\Inventory\InventoryLog;
use App\Models\Inventory\Product;
use App\Models\Purchase\PurchaseOrder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'full_name',
        'email',
        'password',
        'role_id',
        'is_active',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'user_id');
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class, 'user_id');
    }

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class, 'user_id');
    }

    /**
     * Check whether the user has a permission.
     *
     * Supports two call styles:
     *  - hasPermission('manage-inventory')  // legacy slug (Admin/Manager only)
     *  - hasPermission($action, $resource)  // action/resource pair against permissions table
     */
    public function hasPermission(string $action, ?string $resource = null): bool
    {
        if ($resource === null) {
            return match ($action) {
                'manage-inventory',
                'manage-suppliers',
                'manage-purchase-orders' => in_array($this->role?->name, ['Admin', 'Manager'], true),
                'receive-stock' => in_array($this->role?->name, ['Admin', 'Manager', 'Staff'], true),
                'admin' => $this->role?->name === 'Admin',
                default => false,
            };
        }

        return $this->role?->permissions()
            ->where('action', $action)
            ->where('resource', $resource)
            ->exists() ?? false;
    }
}
