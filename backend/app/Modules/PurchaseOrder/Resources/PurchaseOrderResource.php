<?php

namespace App\Modules\PurchaseOrder\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'supplier_id' => $this->supplier_id,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'order_date' => $this->order_date?->toDateString(),
            'exp_delivery' => $this->exp_delivery?->toDateString(),
            'total_amount' => (float) $this->total_amount,
            'description' => $this->description,
            'user_id' => $this->user_id,
            'supplier' => $this->whenLoaded('supplier', fn () => [
                'id' => $this->supplier->id,
                'name' => $this->supplier->name,
            ]),
            'items' => PurchaseOrderItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
