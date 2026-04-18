<?php

namespace App\Modules\PurchaseOrder\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ReceivePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermission('receive-stock');
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'warehouse_id' => 'required|integer|exists:warehouses,id',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|integer|exists:purchase_order_items,id',
            'items.*.qty_received' => 'required|integer|min:1',
        ];
    }
}
