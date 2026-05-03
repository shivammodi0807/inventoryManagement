<?php

namespace App\Modules\Sales\Services;

use App\Models\Sales\SalesOrder;
use App\Modules\Sales\Enums\SalesOrderStatus;
use App\Modules\Sales\Events\SalesOrderConfirmed;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SalesOrderService
{
    /**
     * Get paginated sales orders.
     */
    public function getSalesOrders(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = SalesOrder::query()->with(['customer', 'items.product', 'items.warehouse', 'user']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (! empty($filters['search'])) {
            $query->where('order_number', 'like', "%{$filters['search']}%");
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * Get a single sales order.
     */
    public function getSalesOrder(int $id): SalesOrder
    {
        return SalesOrder::with(['customer', 'items.product', 'items.warehouse', 'user', 'invoice.payments'])->findOrFail($id);
    }

    /**
     * Create a new sales order.
     */
    public function createSalesOrder(array $data): SalesOrder
    {
        return DB::transaction(function () use ($data) {
            $total = collect($data['items'])->sum(fn($i) => (float)$i['unit_price'] * (int)$i['quantity']);
            $tax = (float)($data['tax_amount'] ?? 0);
            $discount = (float)($data['discount_amount'] ?? 0);
            $grandTotal = $total + $tax - $discount;

            $order = SalesOrder::create([
                'order_number' => $this->generateOrderNumber(),
                'customer_id' => $data['customer_id'],
                'user_id' => Auth::id(),
                'status' => SalesOrderStatus::Pending->value,
                'order_date' => $data['order_date'] ?? now(),
                'total_amount' => $total,
                'discount_amount' => $discount,
                'tax_amount' => $tax,
                'grand_total' => $grandTotal,
                'shipping_address' => $data['shipping_address'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'warehouse_id' => $item['warehouse_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => (float)$item['unit_price'] * (int)$item['quantity'],
                ]);
            }

            return $order->fresh(['customer', 'items']);
        });
    }

    /**
     * Confirm a sales order and trigger stock deduction.
     */
    public function confirmSalesOrder(int $id): SalesOrder
    {
        return DB::transaction(function () use ($id) {
            $order = SalesOrder::with('items')->findOrFail($id);

            if ($order->status !== SalesOrderStatus::Pending) {
                throw new DomainException("Order cannot be confirmed. Current status: {$order->status->value}");
            }

            $order->update(['status' => SalesOrderStatus::Confirmed->value]);

            // Dispatch event for inventory deduction
            event(new SalesOrderConfirmed(
                $order->id,
                $order->items->map(fn($i) => [
                    'product_id' => $i->product_id,
                    'warehouse_id' => $i->warehouse_id,
                    'quantity' => $i->quantity,
                ])->toArray()
            ));

            return $order->fresh();
        });
    }

    /**
     * Mark a sales order as shipped.
     */
    public function shipSalesOrder(int $id): SalesOrder
    {
        $order = SalesOrder::findOrFail($id);

        if ($order->status !== SalesOrderStatus::Confirmed) {
            throw new DomainException("Order must be confirmed before shipping. Current status: {$order->status->value}");
        }

        $order->update(['status' => SalesOrderStatus::Shipped->value]);

        return $order->fresh();
    }

    /**
     * Mark a sales order as delivered.
     */
    public function deliverSalesOrder(int $id): SalesOrder
    {
        $order = SalesOrder::findOrFail($id);

        if ($order->status !== SalesOrderStatus::Shipped) {
            throw new DomainException("Order must be shipped before marking as delivered. Current status: {$order->status->value}");
        }

        $order->update(['status' => SalesOrderStatus::Delivered->value]);

        return $order->fresh();
    }

    /**
     * Cancel a sales order.
     */
    public function cancelSalesOrder(int $id): SalesOrder
    {
        return DB::transaction(function () use ($id) {
            $order = SalesOrder::findOrFail($id);

            if (!$order->status->canCancel()) {
                throw new DomainException("Order cannot be cancelled. Current status: {$order->status->value}");
            }

            // Logic to restore stock if already confirmed could be added here
            // via a SalesOrderCancelled event.

            $order->update(['status' => SalesOrderStatus::Cancelled->value]);

            return $order->fresh();
        });
    }

    /**
     * Generate a unique order number.
     */
    private function generateOrderNumber(): string
    {
        $prefix = 'SO-';
        $number = strtoupper(Str::random(8));
        
        while (SalesOrder::where('order_number', $prefix . $number)->exists()) {
            $number = strtoupper(Str::random(8));
        }

        return $prefix . $number;
    }
}
