<?php

namespace App\Modules\Inventory\Services;

use App\Models\Inventory\Unit;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class UnitService
{
    /**
     * Get all units with filter , sorting and pagination
     * @param string $type 
     * @param string $sortBy Column to sort by (default: name)
     * @param string $sortOrder sort order (asc , desc)
     * @param string $perPage Number of items per page
     * @return LengthAwarePaginator
     */
    public function getUnits(?string $type = null, string $sortBy = 'name', string $sortOrder = "asc", string $perPage = "15"): LengthAwarePaginator
    {
        $query = Unit::withCount('products');
        if (!empty($type)) {
            $query->where('type', "like", "%{$type}%");
        }
        $validColumns = ["id", "name", "symbol", "type", "created_at", "updated_at"];
        $sortBy = in_array($sortBy, $validColumns) ? $sortBy : "name";
        $sortOrder = strtolower($sortOrder) === 'desc' ? "desc" : "asc";

        return $query->orderBy($sortBy, $sortOrder)->paginate($perPage);
    }

    /**
     * Get a single unit by ID 
     * @param int $id Unit ID 
     * @return Unit|null
     * 
     */
    public function getUnit(int $id): ?Unit
    {
        return Unit::withCount('products')->find($id);
    }

    /**
     * Get All Products Of Specific ID
     * @param int $id Unit ID 
     * @return Collection
     */
    public function getUnitProducts(int $id): ?Collection
    {
        return Unit::with('products')->orderBy('name')->find($id);
    }

    /**
     * Create a new unit
     * @param array $data unit data
     * @return Unit
     */
    public function createUnit(array $data): Unit
    {
        return Unit::create([
            'name' => $data["name"],
            'symbol' => $data["symbol"],
            "type" => $data["type"] ?? null
        ]);
    }

    /**
     * update a Unit
     * @param int $id Unit ID
     * @param array $data Updated data
     * @return  Unit|null
     */

    public function updateUnit(int $id, array $data): ?Unit
    {
        $unit  = Unit::find($id);

        if (!$unit) {
            return null;
        }

        $unit->update([
            'name' => $data["name"] ?? $unit->name,
            'symbol' => $data["symbol"] ?? $unit->symbol,
            'type' => $data["type"] ?? $unit->type
        ]);
        return $unit;
    }

    /**
     * Delete a Unit and Orphan its Products
     * @param int $id
     * @return bool
     */
    public function deleteUnit(int $id): bool
    {
        $unit = Unit::find($id);

        if (!$unit) {
            return false;
        }

        // Set Unit Products to null
        $unit->products()->update(["unit_id" => null]);

        // delete the unit 
        return $unit->delete();
    }
}
