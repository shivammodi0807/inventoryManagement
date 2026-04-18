<?php

namespace App\Modules\Inventory\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Inventory\Product;
use App\Modules\Inventory\Requests\AdjustStockRequest;
use App\Modules\Inventory\Requests\ReceiveStockRequest;
use App\Modules\Inventory\Resources\InventoryLogResource;
use App\Modules\Inventory\Resources\StockLevelResource;
use App\Modules\Inventory\Services\StockService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class StockController extends Controller
{
    /**
     * Constructor to inject StockService.
     */
    public function __construct(private StockService $stockService) {}

    /**
     * Manually adjust stock (add or remove) for a product at a warehouse.
     */
    public function adjust(AdjustStockRequest $request, int $productId): JsonResponse
    {
        if (! Product::where('id', $productId)->exists()) {
            return response()->json(
                ['message' => 'Product not found'],
                Response::HTTP_NOT_FOUND
            );
        }

        $data = $request->validated();

        try {
            $stock = $this->stockService->adjustStock(
                productId: $productId,
                warehouseId: (int) $data['warehouse_id'],
                quantity: (int) $data['quantity'],
                type: $data['type'],
                notes: $data['notes'] ?? null,
            );
        } catch (DomainException $e) {
            return response()->json(
                ['message' => $e->getMessage()],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        return response()->json(
            new StockLevelResource($stock),
            Response::HTTP_OK
        );
    }

    /**
     * Receive stock for a product at a warehouse inshort stock add in warehouse (type=receipt, positive only).
     */
    public function receive(ReceiveStockRequest $request, int $productId): JsonResponse
    {
        if (! Product::where('id', $productId)->exists()) {
            return response()->json(
                ['message' => 'Product not found'],
                Response::HTTP_NOT_FOUND
            );
        }

        $data = $request->validated();

        $stock = $this->stockService->adjustStock(
            productId: $productId,
            warehouseId: (int) $data['warehouse_id'],
            quantity: (int) $data['quantity'],
            type: 'receipt',
            notes: $data['notes'] ?? null,
        );

        return response()->json(
            new StockLevelResource($stock),
            Response::HTTP_OK
        );
    }

    /**
     * Returns Inventory Log history for a products (paginated, newest first).
     */
    public function history(Request $request, int $productId): AnonymousResourceCollection|JsonResponse
    {
        if (! Product::where('id', $productId)->exists()) {
            return response()->json(
                ['message' => 'Product not found'],
                Response::HTTP_NOT_FOUND
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));

        $logs = $this->stockService->getProductHistory($productId, $perPage);

        return InventoryLogResource::collection($logs);
    }
}
