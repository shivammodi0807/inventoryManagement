<?php

namespace App\Modules\Supplier\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SupplierStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasPermission('manage-suppliers');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:1000',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'payment_terms' => 'nullable|string|max:100',
            'rating' => 'nullable|numeric|min:0|max:5',
            'is_active' => 'nullable|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Supplier name is required.',
            'email.email' => 'Please provide a valid email address.',
            'rating.min' => 'Rating cannot be negative.',
            'rating.max' => 'Rating cannot exceed 5.',
        ];
    }
}
