<?php

namespace App\Modules\PurchaseOrder\Services;

use App\Models\Purchase\PurchaseOrder;
use App\Modules\PurchaseOrder\Enums\PurchaseOrderStatus;
use App\Modules\PurchaseOrder\Events\PurchaseOrderReceived;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PurchaseOrderService
{
    /**
     * Paginated list of purchase orders with optional filters.
     *
     * @param  array{status?: string, supplier_id?: int}  $filters
     */
    public function getPurchaseOrders(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = PurchaseOrder::query()->with(['supplier', 'items']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['supplier_id'])) {
            $query->where('supplier_id', $filters['supplier_id']);
        }

        return $query->latest()->paginate($perPage);
    }

    public function getPurchaseOrder(int $id): ?PurchaseOrder
    {
        return PurchaseOrder::with(['supplier', 'items.product', 'user'])->find($id);
    }

    /**
     * Create a PO in Draft status with its line items. total_amount is computed from items.
     *
     * @param  array{supplier_id:int, order_date:string, exp_delivery?:?string, description?:?string, items: array<int, array{product_id:int, qty_ordered:int, cost_price:float|int|string}>}  $data
     */
    public function createPurchaseOrder(array $data): PurchaseOrder
    {
        return DB::transaction(function () use ($data) {
            $total = collect($data['items'])->sum(
                fn ($i) => (float) $i['cost_price'] * (int) $i['qty_ordered']
            );

            $order = PurchaseOrder::create([
                'supplier_id' => $data['supplier_id'],
                'status' => PurchaseOrderStatus::Draft->value,
                'order_date' => $data['order_date'],
                'exp_delivery' => $data['exp_delivery'] ?? null,
                'total_amount' => $total,
                'description' => $data['description'] ?? null,
                'user_id' => Auth::id(),
            ]);

            foreach ($data['items'] as $item) {
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'qty_ordered' => $item['qty_ordered'],
                    'qty_received' => 0,
                    'cost_price' => $item['cost_price'],
                ]);
            }

            return $order->fresh(['supplier', 'items']);
        });
    }

    /**
     * Update a PO (only allowed in draft status). Items replace existing items when provided.
     */
    public function updatePurchaseOrder(int $id, array $data): PurchaseOrder
    {
        return DB::transaction(function () use ($id, $data) {
            $order = PurchaseOrder::with('items')->findOrFail($id);

            if (! $order->status->isEditable()) {
                throw new DomainException('Purchase order cannot be edited in its current status.');
            }

            $order->update(array_intersect_key($data, array_flip([
                'supplier_id', 'order_date', 'exp_delivery', 'description',
            ])));

            if (isset($data['items'])) {
                $order->items()->delete();
                $total = 0;
                foreach ($data['items'] as $item) {
                    $order->items()->create([
                        'product_id' => $item['product_id'],
                        'qty_ordered' => $item['qty_ordered'],
                        'qty_received' => 0,
                        'cost_price' => $item['cost_price'],
                    ]);
                    $total += (float) $item['cost_price'] * (int) $item['qty_ordered'];
                }
                $order->update(['total_amount' => $total]);
            }

            return $order->fresh(['supplier', 'items']);
        });
    }

    public function submitPurchaseOrder(int $id): PurchaseOrder
    {
        return $this->transitionStatus($id, PurchaseOrderStatus::Draft, PurchaseOrderStatus::Submitted);
    }

    public function confirmPurchaseOrder(int $id): PurchaseOrder
    {
        return $this->transitionStatus($id, PurchaseOrderStatus::Submitted, PurchaseOrderStatus::Confirmed);
    }

    public function cancelPurchaseOrder(int $id): PurchaseOrder
    {
        $order = PurchaseOrder::findOrFail($id);

        if (! $order->status->isCancellable()) {
            throw new DomainException('Purchase order cannot be cancelled in its current status.');
        }

        $order->update(['status' => PurchaseOrderStatus::Cancelled->value]);

        return $order->fresh();
    }

    private function transitionStatus(int $id, PurchaseOrderStatus $from, PurchaseOrderStatus $to): PurchaseOrder
    {
        $order = PurchaseOrder::findOrFail($id);

        if ($order->status !== $from) {
            throw new DomainException(
                "Invalid status transition. Expected {$from->value}, got {$order->status->value}."
            );
        }

        $order->update(['status' => $to->value]);

        return $order->fresh();
    }

    /**
     * Receive stock against a PO. Updates qty_received on each line, advances PO status,
     * and dispatches PurchaseOrderReceived (listened to by Inventory + Supplier modules).
     *
     * @param  array<int, array{item_id:int, qty_received:int}>  $items
     */
    public function receiveStock(int $orderId, int $warehouseId, array $items): PurchaseOrder
    {
        $order = DB::transaction(function () use ($orderId, $items) {
            /** @var PurchaseOrder $order */
            $order = PurchaseOrder::with('items')->lockForUpdate()->findOrFail($orderId);

            if (! $order->status->isReceivable()) {
                throw new DomainException('Purchase order cannot receive stock in its current status.');
            }

            foreach ($items as $incoming) {
                $line = $order->items()->where('id', $incoming['item_id'])->firstOrFail();

                $max = (int) $line->qty_ordered - (int) $line->qty_received;
                if ($max <= 0) {
                    continue;
                }

                $accepting = min((int) $incoming['qty_received'], $max);
                $line->update(['qty_received' => (int) $line->qty_received + $accepting]);
            }

            $order->load('items');
            $allReceived = $order->items->every(fn ($i) => (int) $i->qty_received >= (int) $i->qty_ordered);
            $anyReceived = $order->items->contains(fn ($i) => (int) $i->qty_received > 0);

            $order->update(['status' => $allReceived
                ? PurchaseOrderStatus::Received->value
                : ($anyReceived ? PurchaseOrderStatus::PartiallyReceived->value : $order->status->value),
            ]);

            return $order->fresh(['supplier', 'items']);
        });

        // Dispatch after commit so downstream listeners (stock adjust, rating) see persisted state.
        $payload = collect($items)
            ->map(function (array $i) use ($order) {
                $line = $order->items->firstWhere('id', $i['item_id']);

                return $line ? [
                    'product_id' => (int) $line->product_id,
                    'quantity' => (int) min($i['qty_received'], (int) $line->qty_ordered),
                    'cost_price' => (float) $line->cost_price,
                ] : null;
            })
            ->filter()
            ->values()
            ->all();

        event(new PurchaseOrderReceived(
            orderId: $order->id,
            warehouseId: $warehouseId,
            items: $payload,
        ));

        return $order;
    }

    /**
     * Create multiple POs by grouping products by their preferred supplier.
     *
     * @param array<int, array{product_id:int, qty_to_order:int}> $productSelections
     */
    public function bulkCreatePurchaseOrders(array $productSelections): array
    {
        return DB::transaction(function () use ($productSelections) {
            $productIds = collect($productSelections)->pluck('product_id')->toArray();
            
            // Get product details with preferred suppliers and current cost price
            $products = DB::table('products')
                ->leftJoin('product_supplier', 'products.id', '=', 'product_supplier.product_id')
                ->whereIn('products.id', $productIds)
                ->where('product_supplier.is_preferred', true)
                ->select('products.id', 'products.name', 'products.cost_price', 'product_supplier.supplier_id')
                ->get()
                ->groupBy('supplier_id');

            $createdOrders = [];

            foreach ($products as $supplierId => $supplierProducts) {
                if (!$supplierId) continue;

                $items = $supplierProducts->map(function($p) use ($productSelections) {
                    $selection = collect($productSelections)->firstWhere('product_id', $p->id);
                    return [
                        'product_id' => $p->id,
                        'qty_ordered' => $selection['qty_to_order'],
                        'cost_price' => $p->cost_price,
                    ];
                })->toArray();

                $order = $this->createPurchaseOrder([
                    'supplier_id' => $supplierId,
                    'order_date' => now()->toDateString(),
                    'description' => 'Bulk generated from forecasting analysis.',
                    'items' => $items,
                ]);

                $createdOrders[] = $order;
            }

            return $createdOrders;
        });
    }
}
