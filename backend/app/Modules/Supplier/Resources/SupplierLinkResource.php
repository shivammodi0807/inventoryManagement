<?php

namespace App\Modules\Supplier\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Represents a supplier linked to a product (includes pivot data).
 */
class SupplierLinkResource extends JsonResource
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
            'name' => $this->name,
            'contact_name' => $this->contact_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'supplier_sku' => $this->pivot?->supplier_sku,
            'cost_price' => $this->pivot?->cost_price,
            'est_delivery_days' => $this->pivot?->est_delivery_days,
            'is_preferred' => (bool) $this->pivot?->is_preferred,
            'min_order_qty' => $this->pivot?->min_order_qty,
        ];
    }
}
