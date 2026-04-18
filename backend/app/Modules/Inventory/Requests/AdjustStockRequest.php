<?php

namespace App\Modules\Inventory\Requests;

use App\Models\Inventory\Product;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdjustStockRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $id = $this->route('product') ?? $this->route('productId');
        $product = Product::find($id);

        if (! $product) {
            return true;
        }

        return $this->user()?->can('adjustStock', $product) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'warehouse_id' => 'required|integer|exists:warehouses,id',
            'quantity' => ['required', 'integer', 'not_in:0'],
            'type' => ['required', Rule::in(['adjustment', 'transfer', 'return', 'damage', 'sale'])],
            'notes' => 'nullable|string|max:1000',
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
            'warehouse_id.required' => 'Warehouse is required.',
            'warehouse_id.exists' => 'The selected warehouse does not exist.',
            'quantity.required' => 'Quantity is required.',
            'quantity.integer' => 'Quantity must be an integer (positive to add, negative to remove).',
            'quantity.not_in' => 'Quantity cannot be zero.',
            'type.required' => 'Adjustment type is required.',
            'type.in' => 'Invalid adjustment type.',
        ];
    }
}
