<?php

namespace App\Modules\PurchaseOrder\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'purchase_order_id' => $this->purchase_order_id,
            'product_id' => $this->product_id,
            'qty_ordered' => (int) $this->qty_ordered,
            'qty_received' => (int) $this->qty_received,
            'cost_price' => (float) $this->cost_price,
            'line_total' => (float) $this->cost_price * (int) $this->qty_ordered,
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product->id,
                'sku' => $this->product->sku,
                'name' => $this->product->name,
            ]),
        ];
    }
}
