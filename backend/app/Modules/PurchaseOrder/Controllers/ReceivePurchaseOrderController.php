<?php

namespace App\Modules\PurchaseOrder\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\PurchaseOrder\Requests\ReceivePurchaseOrderRequest;
use App\Modules\PurchaseOrder\Resources\PurchaseOrderResource;
use App\Modules\PurchaseOrder\Services\PurchaseOrderService;
use DomainException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

/**
 * Single-action controller for receiving stock against a PO.
 */
class ReceivePurchaseOrderController extends Controller
{
    public function __construct(private PurchaseOrderService $service) {}

    public function __invoke(ReceivePurchaseOrderRequest $request, int $id): JsonResponse
    {
        $data = $request->validated();

        try {
            $order = $this->service->receiveStock($id, (int) $data['warehouse_id'], $data['items']);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Purchase order or item not found'], Response::HTTP_NOT_FOUND);
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return response()->json(new PurchaseOrderResource($order));
    }
}
