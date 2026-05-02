<?php

namespace App\Modules\Inventory\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Inventory\Warehouse;
use App\Modules\Inventory\Requests\WarehouseStoreRequest;
use App\Modules\Inventory\Requests\WarehouseUpdateRequest;
use App\Modules\Inventory\Resources\WarehouseResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;

class WarehouseController extends Controller
{
    /**
     * Display a listing of the warehouses.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Warehouse::query();

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $warehouses = $query->orderBy('name')->get();

        return WarehouseResource::collection($warehouses);
    }

    /**
     * Store a newly created warehouse.
     */
    public function store(WarehouseStoreRequest $request): WarehouseResource
    {
        $warehouse = Warehouse::create($request->validated());

        return new WarehouseResource($warehouse);
    }

    /**
     * Display the specified warehouse.
     */
    public function show(Warehouse $warehouse): WarehouseResource
    {
        return new WarehouseResource($warehouse);
    }

    /**
     * Update the specified warehouse.
     */
    public function update(WarehouseUpdateRequest $request, Warehouse $warehouse): WarehouseResource
    {
        $warehouse->update($request->validated());

        return new WarehouseResource($warehouse->fresh());
    }

    /**
     * Soft-delete (deactivate) the specified warehouse.
     * We mark it inactive rather than hard-deleting to preserve stock history.
     */
    public function destroy(Warehouse $warehouse): JsonResponse
    {
        // If warehouse has active stock levels, deactivate instead of deleting
        if ($warehouse->stockLevels()->where('total_stock', '>', 0)->exists()) {
            $warehouse->update(['is_active' => false]);

            return response()->json([
                'message' => 'Warehouse deactivated. It has stock and cannot be permanently deleted.',
                'deactivated' => true,
            ]);
        }

        $warehouse->delete();

        return response()->json(['message' => 'Warehouse deleted successfully.'], 200);
    }
}
