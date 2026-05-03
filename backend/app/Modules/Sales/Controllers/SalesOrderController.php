<?php

namespace App\Modules\Sales\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Sales\Services\SalesOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SalesOrderController extends Controller
{
    public function __construct(private SalesOrderService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'customer_id', 'search']);
        $perPage = (int) $request->query('per_page', 15);
        
        $orders = $this->service->getSalesOrders($filters, $perPage);
        return response()->json($orders);
    }

    public function store(Request $request): JsonResponse
    {
        // Simple validation for now, should ideally use a Request class
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'order_date' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.warehouse_id' => 'required|exists:warehouses,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'shipping_address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $order = $this->service->createSalesOrder($validated);
        return response()->json($order, Response::HTTP_CREATED);
    }

    public function show(int $id): JsonResponse
    {
        $order = $this->service->getSalesOrder($id);
        return response()->json($order);
    }

    public function confirm(int $id): JsonResponse
    {
        try {
            $order = $this->service->confirmSalesOrder($id);
            return response()->json($order);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function cancel(int $id): JsonResponse
    {
        try {
            $order = $this->service->cancelSalesOrder($id);
            return response()->json($order);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
