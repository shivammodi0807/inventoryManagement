<?php

namespace App\Modules\Supplier\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Supplier\Supplier;
use App\Modules\Supplier\Requests\SupplierStoreRequest;
use App\Modules\Supplier\Requests\SupplierUpdateRequest;
use App\Modules\Supplier\Resources\SupplierResource;
use App\Modules\Supplier\Services\SupplierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class SupplierController extends Controller
{
    public function __construct(private SupplierService $supplierService) {}

    /**
     * Display a listing of suppliers (paginated).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = [
            'search' => $request->query('search'),
            'is_active' => $request->query('is_active'),
        ];

        $sortBy = $request->query('sort_by', 'name');
        $sortOrder = $request->query('sort_order', 'asc');
        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));

        $suppliers = $this->supplierService->getSuppliers($filters, $sortBy, $sortOrder, $perPage);

        return SupplierResource::collection($suppliers);
    }

    public function store(SupplierStoreRequest $request): JsonResponse
    {
        $supplier = $this->supplierService->createSupplier($request->validated());

        return response()->json(new SupplierResource($supplier), Response::HTTP_CREATED);
    }

    public function show(int $id): JsonResponse
    {
        $supplier = $this->supplierService->getSupplier($id);

        if (! $supplier) {
            return response()->json(['message' => 'Supplier not found'], Response::HTTP_NOT_FOUND);
        }

        return response()->json(new SupplierResource($supplier));
    }

    public function update(SupplierUpdateRequest $request, int $id): JsonResponse
    {
        $supplier = $this->supplierService->updateSupplier($id, $request->validated());

        if (! $supplier) {
            return response()->json(['message' => 'Supplier not found'], Response::HTTP_NOT_FOUND);
        }

        return response()->json(new SupplierResource($supplier));
    }

    /**
     * Deactivate (set is_active=false) a supplier. Admin-only.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        if (! $request->user()->hasPermission('admin')) {
            return response()->json(['message' => 'Insufficient permissions.'], Response::HTTP_FORBIDDEN);
        }

        $ok = $this->supplierService->deactivateSupplier($id);

        if (! $ok) {
            return response()->json(['message' => 'Supplier not found'], Response::HTTP_NOT_FOUND);
        }

        return response()->json(['message' => 'Supplier deactivated'], Response::HTTP_NO_CONTENT);
    }

    /**
     * Supplier delivery performance metrics. Manager+.
     */
    public function performance(Request $request, int $id): JsonResponse
    {
        if (! $request->user()->hasPermission('manage-suppliers')) {
            return response()->json(['message' => 'Insufficient permissions.'], Response::HTTP_FORBIDDEN);
        }

        $supplier = Supplier::find($id);

        if (! $supplier) {
            return response()->json(['message' => 'Supplier not found'], Response::HTTP_NOT_FOUND);
        }

        return response()->json($this->supplierService->getPerformance($supplier));
    }
}
