<?php

namespace App\Modules\Supplier\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Represents a product linked to a supplier (includes pivot data).
 */
class ProductLinkResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'name' => $this->name,
            'supplier_sku' => $this->pivot?->supplier_sku,
            'cost_price' => $this->pivot?->cost_price,
            'est_delivery_days' => $this->pivot?->est_delivery_days,
            'is_preferred' => (bool) $this->pivot?->is_preferred,
            'min_order_qty' => $this->pivot?->min_order_qty,
        ];
    }
}
