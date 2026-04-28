<?php

namespace App\Modules\Auth\Requests;

use App\Shared\Services\SealedRoleGuard;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleStoreRequest extends FormRequest
{
    /**
     * Authorization is enforced by the route-level `permission:create,role`
     * middleware.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:50',
                'unique:roles,name',
                // Sealed role names are reserved.
                Rule::notIn(SealedRoleGuard::SEALED_ROLES),
            ],
            'description' => ['nullable', 'string', 'max:255'],
            'permission_ids' => ['sometimes', 'array'],
            'permission_ids.*' => ['integer', 'exists:permissions,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.not_in' => 'The names "Admin" and "Guest" are reserved for sealed roles.',
        ];
    }
}
