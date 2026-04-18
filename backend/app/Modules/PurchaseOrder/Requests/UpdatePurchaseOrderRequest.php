<?php

namespace App\Modules\PurchaseOrder\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermission('manage-purchase-orders');
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'supplier_id' => 'sometimes|required|integer|exists:suppliers,id',
            'order_date' => 'sometimes|required|date',
            'exp_delivery' => 'nullable|date',
            'description' => 'nullable|string|max:1000',
            'items' => 'sometimes|array|min:1',
            'items.*.product_id' => 'required_with:items|integer|exists:products,id',
            'items.*.qty_ordered' => 'required_with:items|integer|min:1',
            'items.*.cost_price' => 'required_with:items|numeric|min:0',
        ];
    }
}
