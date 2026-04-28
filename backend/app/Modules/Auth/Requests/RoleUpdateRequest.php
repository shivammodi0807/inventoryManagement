<?php

namespace App\Modules\Auth\Requests;

use App\Shared\Services\SealedRoleGuard;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $roleId = $this->route('role')?->id;

        return [
            'name' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('roles', 'name')->ignore($roleId),
                // Cannot rename a non-sealed role TO a sealed name; the
                // SealedRoleGuard separately blocks renaming OF sealed roles.
                Rule::notIn(SealedRoleGuard::SEALED_ROLES),
            ],
            'description' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.not_in' => 'The names "Admin" and "Guest" are reserved for sealed roles.',
        ];
    }
}
