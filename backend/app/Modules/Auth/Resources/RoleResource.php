<?php

namespace App\Modules\Auth\Resources;

use App\Shared\Services\SealedRoleGuard;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'is_sealed' => SealedRoleGuard::isSealed($this->resource),
            'is_admin' => SealedRoleGuard::isAdminRole($this->resource),
            'is_guest' => SealedRoleGuard::isGuestRole($this->resource),
            // user_count is exposed only when the controller eager-loads it
            // via withCount('users'); avoids N+1 in list responses.
            'user_count' => $this->whenCounted('users'),
            // permissions are exposed only when explicitly loaded (show()),
            // never on list endpoints (would be a 40-row payload per role).
            'permissions' => PermissionResource::collection($this->whenLoaded('permissions')),
        ];
    }
}
