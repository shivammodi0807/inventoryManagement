<?php

namespace App\Modules\Inventory\Resources;

use App\Modules\Inventory\Resources\CategoryResource;
use App\Modules\Inventory\Resources\StockLevelResource;
use App\Modules\Inventory\Resources\UnitResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'description' => $this->description,
            'category_id' => $this->category_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'unit_id' => $this->unit_id,
            'unit' => new UnitResource($this->whenLoaded('unit')),
            'unit_price' => $this->unit_price,
            'cost_price' => $this->cost_price,
            'reorder_point' => $this->reorder_point,
            'reorder_quantity' => $this->reorder_quantity,
            'lead_time_days' => $this->lead_time_days,
            'attributes' => $this->attributes,
            'image_url' => $this->image_url,
            'is_active' => $this->is_active,
            'user_id' => $this->user_id,
            'total_stock' => $this->when($this->relationLoaded('stockLevels'), fn () => $this->total_stock),
            'stock_status' => $this->when($this->relationLoaded('stockLevels'), fn () => $this->stock_status),
            'stock_levels' => $this->when(
                $this->relationLoaded('stockLevels'),
                fn () => StockLevelResource::collection($this->stockLevels)
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
