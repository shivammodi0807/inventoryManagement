<?php

namespace App\Modules\Inventory\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
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
            'description' => $this->description,
            'parent_id' => $this->parent_id,
            'parent' => new self($this->whenLoaded('parent')),
            'children_count' => $this->whenCounted('childrenCount'),
            'products_count' => $this->whenCounted('productsCount'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
