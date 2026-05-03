<?php

namespace App\Modules\Sales\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Sales\Services\CustomerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CustomerController extends Controller
{
    public function __construct(private CustomerService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'is_active']);
        $perPage = (int) $request->query('per_page', 15);
        
        $customers = $this->service->getCustomers($filters, $perPage);
        return response()->json($customers);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:customers,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'tax_id' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        $customer = $this->service->createCustomer($validated);
        return response()->json($customer, Response::HTTP_CREATED);
    }

    public function show(int $id): JsonResponse
    {
        $customer = \App\Models\Sales\Customer::findOrFail($id);
        return response()->json($customer);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:customers,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'tax_id' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        $customer = $this->service->updateCustomer($id, $validated);
        return response()->json($customer);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->deleteCustomer($id);
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
