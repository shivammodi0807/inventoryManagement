<?php

namespace App\Modules\Auth\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Flat permission list ("action:resource") drives the SPA `can()`
        // helper. Eager-load `role.permissions` upstream to avoid N+1.
        $permissions = $this->role?->permissions
            ->map(fn ($p) => "{$p->action}:{$p->resource}")
            ->values()
            ->all() ?? [];

        return [
            'id' => $this->id,
            'email' => $this->email,
            'full_name' => $this->full_name,
            'is_active' => $this->is_active,
            'last_login_at' => $this->last_login_at,
            'role' => [
                'id' => $this->role->id,
                'name' => $this->role->name,
                'description' => $this->role->description,
            ],
            'permissions' => $permissions,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
