<?php

namespace App\Modules\PurchaseOrder\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Purchase\PurchaseOrder;
use App\Modules\PurchaseOrder\Requests\StorePurchaseOrderRequest;
use App\Modules\PurchaseOrder\Requests\UpdatePurchaseOrderRequest;
use App\Modules\PurchaseOrder\Resources\PurchaseOrderResource;
use App\Modules\PurchaseOrder\Services\PurchaseOrderService;
use Barryvdh\DomPDF\Facade\Pdf;
use DomainException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class PurchaseOrderController extends Controller
{
    public function __construct(private PurchaseOrderService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = [
            'status' => $request->query('status'),
            'supplier_id' => $request->query('supplier_id'),
        ];

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $orders = $this->service->getPurchaseOrders($filters, $perPage);

        return PurchaseOrderResource::collection($orders);
    }

    public function store(StorePurchaseOrderRequest $request): JsonResponse
    {
        $order = $this->service->createPurchaseOrder($request->validated());

        return response()->json(new PurchaseOrderResource($order), Response::HTTP_CREATED);
    }

    public function show(int $id): JsonResponse
    {
        $order = $this->service->getPurchaseOrder($id);

        if (! $order) {
            return response()->json(['message' => 'Purchase order not found'], Response::HTTP_NOT_FOUND);
        }

        return response()->json(new PurchaseOrderResource($order));
    }

    public function update(UpdatePurchaseOrderRequest $request, int $id): JsonResponse
    {
        try {
            $order = $this->service->updatePurchaseOrder($id, $request->validated());
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Purchase order not found'], Response::HTTP_NOT_FOUND);
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return response()->json(new PurchaseOrderResource($order));
    }

    public function submit(Request $request, int $id): JsonResponse
    {
        $order = PurchaseOrder::find($id);
        if (! $order) {
            return response()->json(['message' => 'Purchase order not found'], Response::HTTP_NOT_FOUND);
        }
        $this->authorize('submit', $order);

        try {
            $order = $this->service->submitPurchaseOrder($id);
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return response()->json(new PurchaseOrderResource($order));
    }

    public function confirm(Request $request, int $id): JsonResponse
    {
        $order = PurchaseOrder::find($id);
        if (! $order) {
            return response()->json(['message' => 'Purchase order not found'], Response::HTTP_NOT_FOUND);
        }
        $this->authorize('confirm', $order);

        try {
            $order = $this->service->confirmPurchaseOrder($id);
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return response()->json(new PurchaseOrderResource($order));
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $order = PurchaseOrder::find($id);
        if (! $order) {
            return response()->json(['message' => 'Purchase order not found'], Response::HTTP_NOT_FOUND);
        }
        $this->authorize('cancel', $order);

        try {
            $order = $this->service->cancelPurchaseOrder($id);
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return response()->json(new PurchaseOrderResource($order));
    }

    public function export(int $id)
    {
        $order = $this->service->getPurchaseOrder($id);

        if (! $order) {
            return response()->json(['message' => 'Purchase order not found'], Response::HTTP_NOT_FOUND);
        }

        $pdf = Pdf::loadView('purchase-order::pdf', ['order' => $order]);

        return $pdf->download("PO-{$order->order_number}.pdf");
    }
}
