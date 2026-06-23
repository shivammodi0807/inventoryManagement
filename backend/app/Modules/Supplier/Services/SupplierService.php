<?php

namespace App\Modules\Supplier\Services;

use App\Models\Supplier\Supplier;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class SupplierService
{
    /**
     * Get suppliers with optional filtering and sorting.
     *
     * @param  array  $filters  Optional filters (search, is_active)
     */
    public function getSuppliers(
        array $filters = [],
        string $sortBy = 'name',
        string $sortOrder = 'asc',
        int $perPage = 15
    ): LengthAwarePaginator {
        $query = Supplier::query();

        if (! empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (isset($filters['is_active'])) {
            filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN)
                ? $query->active()
                : $query->where('is_active', false);
        }

        $validColumns = ['id', 'name', 'rating', 'created_at', 'updated_at'];
        $sortBy = in_array($sortBy, $validColumns, true) ? $sortBy : 'name';
        $sortOrder = strtolower($sortOrder) === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sortBy, $sortOrder)->paginate($perPage);
    }

    /**
     * Get a single supplier with its linked products.
     */
    public function getSupplier(int $id): ?Supplier
    {
        return Supplier::with('products')->find($id);
    }

    public function createSupplier(array $data): Supplier
    {
        return Supplier::create([
            'name' => $data['name'],
            'contact_name' => $data['contact_name'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'country' => $data['country'] ?? null,
            'payment_terms' => $data['payment_terms'] ?? null,
            'rating' => $data['rating'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function updateSupplier(int $id, array $data): ?Supplier
    {
        $supplier = Supplier::find($id);

        if (! $supplier) {
            return null;
        }

        $supplier->update($data);

        return $supplier;
    }

    /**
     * Deactivate a supplier (sets is_active=false without deleting the row).
     *
     * @return bool True if the supplier was found and deactivated.
     */
    public function deactivateSupplier(int $id): bool
    {
        $supplier = Supplier::find($id);

        if (! $supplier) {
            return false;
        }

        $supplier->update(['is_active' => false]);

        return true;
    }

    /**
     * Link a product to a supplier with pivot data.
     *
     * If is_preferred is true, unsets other preferred suppliers for the same product
     * so that only one preferred supplier exists per product.
     */
    public function linkProduct(Supplier $supplier, array $data): void
    {
        DB::transaction(function () use ($supplier, $data) {
            if (($data['is_preferred'] ?? false) === true) {
                DB::table('product_supplier')
                    ->where('product_id', $data['product_id'])
                    ->update(['is_preferred' => false]);
            }

            $supplier->products()->syncWithoutDetaching([
                $data['product_id'] => [
                    'supplier_sku' => $data['supplier_sku'] ?? null,
                    'cost_price' => $data['cost_price'],
                    'est_delivery_days' => $data['est_delivery_days'],
                    'is_preferred' => (bool) ($data['is_preferred'] ?? false),
                    'min_order_qty' => $data['min_order_qty'] ?? 1,
                ],
            ]);
        });
    }

    public function unlinkProduct(Supplier $supplier, int $productId): bool
    {
        return $supplier->products()->detach($productId) > 0;
    }

    /**
     * Aggregate supplier delivery performance metrics.
     *
     * @return array<string, int|float|null>
     */
    public function getPerformance(Supplier $supplier): array
    {
        $closed = $supplier->purchaseOrders()
            ->whereIn('status', ['received', 'partially_received'])
            ->count();

        $onTime = $supplier->purchaseOrders()
            ->where('status', 'received')
            ->whereColumn('updated_at', '<=', 'exp_delivery')
            ->count();

        return [
            'total_closed_orders' => $closed,
            'on_time_deliveries' => $onTime,
            'on_time_rate' => $closed > 0 ? round($onTime / $closed, 2) : null,
            'current_rating' => $supplier->rating !== null ? (float) $supplier->rating : null,
        ];
    }
}
