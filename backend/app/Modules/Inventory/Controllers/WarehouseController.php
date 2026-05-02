<?php

namespace App\Modules\Inventory\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Inventory\Warehouse;
use App\Modules\Inventory\Resources\WarehouseResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

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
}
