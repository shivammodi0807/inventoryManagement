<?php

namespace App\Modules\Inventory\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UnitStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasPermission('manage-inventory');
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
            "symbol" => 'required|string',
            'type' => 'nullable|string'
        ];
    }

    /**
     * Get Custom Messages For Validations
     */
    public function messages()
    {
        return [
            'name.required' => "Unit Name is required",
            'name.string' => "Unit Name must be of type string",
            'name.max:255' => 'Unit Name is too large',
            'symbol.required' => 'Symbol Name is required'
        ];
    }
}
