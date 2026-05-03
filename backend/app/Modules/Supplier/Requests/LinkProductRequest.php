<?php

namespace App\Modules\Supplier\Requests;

use App\Models\Supplier\Supplier;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class LinkProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $id = $this->route('supplier') ?? $this->route('supplierId');
        $supplier = Supplier::find($id);

        if (! $supplier) {
            return true;
        }

        return $this->user()?->can('linkProduct', $supplier) ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('is_preferred')) {
            $this->merge([
                'is_preferred' => filter_var($this->is_preferred, FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => 'required|integer|exists:products,id',
            'supplier_sku' => 'nullable|string|max:255',
            'cost_price' => 'required|numeric|min:0',
            'est_delivery_days' => 'required|integer|min:1',
            'is_preferred' => 'nullable|boolean',
            'min_order_qty' => 'nullable|integer|min:1',
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
            'product_id.required' => 'Product is required.',
            'product_id.exists' => 'The selected product does not exist.',
            'cost_price.required' => 'Cost price is required.',
            'cost_price.min' => 'Cost price cannot be negative.',
            'est_delivery_days.required' => 'Estimated delivery days is required.',
            'est_delivery_days.min' => 'Estimated delivery days must be at least 1.',
        ];
    }
}
