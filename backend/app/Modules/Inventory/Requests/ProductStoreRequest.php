<?php

namespace App\Modules\Inventory\Requests;

use App\Models\Inventory\Product;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProductStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Product::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => filter_var($this->is_active, FILTER_VALIDATE_BOOLEAN),
            ]);
        }

        if ($this->has('auto_po_generation')) {
            $this->merge([
                'auto_po_generation' => filter_var($this->auto_po_generation, FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'sku' => 'nullable|string|max:255|unique:products,sku',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'category_id' => 'nullable|integer|exists:categories,id',
            'unit_price' => 'required|numeric|min:0',
            'cost_price' => 'required|numeric|min:0',
            'unit_id' => 'required|integer|exists:units,id',
            'reorder_point' => 'required|integer|min:0',
            'reorder_quantity' => 'required|integer|min:0',
            'lead_time_days' => 'nullable|integer|min:0',
            'attributes' => 'nullable|array',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_active' => 'nullable|boolean',
            'auto_po_generation' => 'nullable|boolean',
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
            'sku.required' => 'Product SKU is required.',
            'sku.unique' => 'A product with this SKU already exists.',
            'name.required' => 'Product name is required.',
            'unit_price.required' => 'Unit price is required.',
            'unit_price.min' => 'Unit price cannot be negative.',
            'cost_price.required' => 'Cost price is required.',
            'cost_price.min' => 'Cost price cannot be negative.',
            'unit_id.required' => 'Unit is required.',
            'unit_id.exists' => 'The selected unit does not exist.',
            'category_id.exists' => 'The selected category does not exist.',
        ];
    }
}
