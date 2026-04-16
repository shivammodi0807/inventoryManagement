<?php

namespace App\Modules\Inventory\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Requests\UnitStoreRequest;
use App\Modules\Inventory\Requests\UnitUpdateRequest;
use App\Modules\Inventory\Resources\UnitResource;
use App\Modules\Inventory\Services\UnitService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UnitController extends Controller
{

    public function __construct(private UnitService $unitService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $type = $request->query('type', null);
        $sortBy = $request->query('sort_by', "name");
        $sortOrder = $request->query('sort_order', 'asc');
        $perPage = max(1, min(100, (int)$request->query('per_page', 15)));

        $units = $this->unitService->getUnits(
            $type,
            $sortBy,
            $sortOrder,
            $perPage
        );
        return UnitResource::collection($units);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UnitStoreRequest $request)
    {
        $unit = $this->unitService->createUnit($request->validated());

        return response()->json(
            new UnitResource($unit),
            Response::HTTP_CREATED
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $unit = $this->unitService->getUnit($id);

        if (!$unit) {
            return  response()->json(
                ['message' => 'Unit not found'],
                Response::HTTP_NOT_FOUND
            );
        }
        return response()->json(new UnitResource($unit));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UnitUpdateRequest $request, int $id)
    {
        $unit = $this->unitService->updateUnit(
            $id,
            $request->validated()
        );

        if (!$unit) {
            return response()->json(
                ["message" => "Unit not found"],
                Response::HTTP_NOT_FOUND
            );
        }

        return response()->json(
            new UnitResource($unit),
            Response::HTTP_OK
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id)
    {
        $deleted = $this->unitService->deleteUnit($id);

        if (!$deleted) {
            return response()->json(
                ['message' => "Unit not found"],
                Response::HTTP_NOT_FOUND
            );
        }

        return response()->json(
            ['message' => "Unit deleted successfully"],
            Response::HTTP_NO_CONTENT
        );
    }
}
