<?php

namespace App\Modules\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    /**
     * Public self-service signup endpoint. Authorization happens by virtue
     * of the route being unauthenticated and rate-limited.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Strong password policy: min 12 chars, mixed case, numbers, symbols.
     * Role + active flag are NOT accepted from the request body — new users
     * always land in the Guest role and active=true. Admins promote later.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => [
                'required',
                'confirmed',
                Password::min(12)->mixedCase()->numbers()->symbols(),
            ],
        ];
    }
}
