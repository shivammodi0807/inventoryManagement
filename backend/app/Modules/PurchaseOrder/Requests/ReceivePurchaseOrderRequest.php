<?php

namespace App\Modules\PurchaseOrder\Requests;

use App\Models\Purchase\PurchaseOrder;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ReceivePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        $id = $this->route('id') ?? $this->route('purchase_order');
        $order = PurchaseOrder::find($id);

        if (! $order) {
            return true;
        }

        return $this->user()?->can('receive', $order) ?? false;
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
