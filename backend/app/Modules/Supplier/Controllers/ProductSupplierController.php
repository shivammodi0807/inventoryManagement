<?php

namespace App\Modules\Supplier\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Supplier\Supplier;
use App\Modules\Supplier\Requests\LinkProductRequest;
use App\Modules\Supplier\Services\SupplierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProductSupplierController extends Controller
{
    public function __construct(private SupplierService $supplierService) {}

    /**
     * Link a product to a supplier with pivot pricing/delivery data.
     */
    public function store(LinkProductRequest $request, int $supplierId): JsonResponse
    {
        $supplier = Supplier::find($supplierId);

        if (! $supplier) {
            return response()->json(['message' => 'Supplier not found'], Response::HTTP_NOT_FOUND);
        }

        $this->supplierService->linkProduct($supplier, $request->validated());

        return response()->json(['message' => 'Product linked'], Response::HTTP_CREATED);
    }

    /**
     * Unlink a product from a supplier.
     */
    public function destroy(Request $request, int $supplierId, int $productId): JsonResponse
    {
        if (! $request->user()->hasPermission('manage-suppliers')) {
            return response()->json(['message' => 'Insufficient permissions.'], Response::HTTP_FORBIDDEN);
        }

        $supplier = Supplier::find($supplierId);

        if (! $supplier) {
            return response()->json(['message' => 'Supplier not found'], Response::HTTP_NOT_FOUND);
        }

        $detached = $this->supplierService->unlinkProduct($supplier, $productId);

        if (! $detached) {
            return response()->json(['message' => 'Link not found'], Response::HTTP_NOT_FOUND);
        }

        return response()->json(['message' => 'Product unlinked'], Response::HTTP_NO_CONTENT);
    }
}
