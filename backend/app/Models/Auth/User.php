<?php

namespace App\Models\Auth;

use App\Models\Inventory\InventoryLog;
use App\Models\Inventory\Product;
use App\Models\Purchase\PurchaseOrder;
use App\Notifications\Auth\ResetPasswordNotification;
use App\Notifications\Auth\VerifyEmailNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
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
     * Check whether the user's role grants ($action, $resource).
     *
     * Permissions are dynamic and managed by admins via /api/roles/{role}/permissions.
     * Sealed roles (Admin/Guest) preserve identity invariants but Admin's
     * permission set is also sealed at full coverage by SealedRoleGuard.
     */
    public function hasPermission(string $action, string $resource): bool
    {
        return $this->role?->permissions()
            ->where('action', $action)
            ->where('resource', $resource)
            ->exists() ?? false;
    }

    /**
     * Override the default Laravel reset-password notification so that the
     * link points at the SPA reset page instead of a non-existent web route.
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * Override the default verification notification so the link points at
     * the SPA `/verify-email/{id}/{hash}` page (which then forwards the
     * signed params to the backend verify endpoint).
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmailNotification());
    }
}
