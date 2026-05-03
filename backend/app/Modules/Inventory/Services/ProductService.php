<?php

namespace App\Modules\Inventory\Services;

use App\Models\Inventory\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductService
{
    /**
     * Get all products with optional filtering and sorting.
     *
     * @param  array  $filters  Optional filters (search, name, sku, category_id, unit_id, is_active)
     * @param  string  $sortBy  Column to sort by (default: name)
     * @param  string  $sortOrder  Sort order (asc, desc)
     * @param  int  $perPage  Number of items per page
     */
    public function getProducts(
        array $filters = [],
        string $sortBy = 'name',
        string $sortOrder = 'asc',
        int $perPage = 15
    ): LengthAwarePaginator {
        $query = Product::with(['category', 'unit']);

        if (! empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (! empty($filters['name'])) {
            $query->where('name', 'like', "%{$filters['name']}%");
        }

        if (! empty($filters['sku'])) {
            $query->where('sku', 'like', "%{$filters['sku']}%");
        }

        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }

        if (isset($filters['is_active'])) {
            (bool) $filters['is_active']
                ? $query->active()
                : $query->where('is_active', false);
        }

        if (isset($filters['stock_status'])) {
            $status = $filters['stock_status'];
            if ($status === 'low') {
                $query->lowStock();
            } elseif ($status === 'critical') {
                $query->whereHas('stockLevels', function ($q) {
                    $q->havingRaw('SUM(current_stock) <= (products.reorder_point * 0.5)');
                });
            } elseif ($status === 'out') {
                $query->whereHas('stockLevels', function ($q) {
                    $q->havingRaw('SUM(current_stock) <= 0');
                });
            } elseif ($status === 'overstock') {
                $query->whereHas('stockLevels', function ($q) {
                    $q->havingRaw('SUM(current_stock) > (products.reorder_point * 3)');
                });
            }
        }

        $validColumns = ['id', 'sku', 'name', 'unit_price', 'cost_price', 'created_at', 'updated_at'];
        $sortBy = in_array($sortBy, $validColumns) ? $sortBy : 'name';
        $sortOrder = strtolower($sortOrder) === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sortBy, $sortOrder)->paginate($perPage);
    }

    /**
     * Get a single product by ID with relationships.
     *
     * @param  int  $id  Product ID
     */
    public function getProduct(int $id): ?Product
    {
        return Product::with(['category', 'unit', 'creator', 'stockLevels.warehouse', 'suppliers'])->find($id);
    }

    /**
     * Create a new product.
     *
     * @param  array  $data  Product data
     * @param  int  $userId  Authenticated user ID (creator)
     */
    public function createProduct(array $data, int $userId): Product
    {
        $sku = $data['sku'] ?? $this->generateUniqueSku();

        $imageUrl = null;
        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            $path = $data['image']->store('products', 'public');
            $imageUrl = $path;
        }

        return Product::create([
            'sku' => $sku,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'category_id' => $data['category_id'] ?? null,
            'unit_price' => $data['unit_price'],
            'cost_price' => $data['cost_price'],
            'unit_id' => $data['unit_id'],
            'reorder_point' => $data['reorder_point'],
            'reorder_quantity' => $data['reorder_quantity'],
            'lead_time_days' => $data['lead_time_days'] ?? 7,
            'attributes' => $data['attributes'] ?? null,
            'image_url' => $imageUrl ?? ($data['image_url'] ?? null),
            'is_active' => filter_var($data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'auto_po_generation' => filter_var($data['auto_po_generation'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'user_id' => $userId,
        ]);
    }

    /**
     * Update a product.
     *
     * @param  int  $id  Product ID
     * @param  array  $data  Updated data
     */
    public function updateProduct(int $id, array $data): ?Product
    {
        $product = Product::find($id);

        if (! $product) {
            return null;
        }

        $imageUrl = $product->image_url;
        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            // Delete old image if exists
            if ($product->image_url && Storage::disk('public')->exists($product->image_url)) {
                Storage::disk('public')->delete($product->image_url);
            }
            $path = $data['image']->store('products', 'public');
            $imageUrl = $path;
        } elseif (array_key_exists('image_url', $data)) {
            $imageUrl = $data['image_url'];
        }

        $product->update([
            'sku' => $data['sku'] ?? $product->sku,
            'name' => $data['name'] ?? $product->name,
            'description' => $data['description'] ?? $product->description,
            'category_id' => array_key_exists('category_id', $data) ? $data['category_id'] : $product->category_id,
            'unit_price' => $data['unit_price'] ?? $product->unit_price,
            'cost_price' => $data['cost_price'] ?? $product->cost_price,
            'unit_id' => $data['unit_id'] ?? $product->unit_id,
            'reorder_point' => $data['reorder_point'] ?? $product->reorder_point,
            'reorder_quantity' => $data['reorder_quantity'] ?? $product->reorder_quantity,
            'lead_time_days' => $data['lead_time_days'] ?? $product->lead_time_days,
            'attributes' => array_key_exists('attributes', $data) ? $data['attributes'] : $product->attributes,
            'image_url' => $imageUrl,
            'is_active' => array_key_exists('is_active', $data) ? filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN) : $product->is_active,
            'auto_po_generation' => array_key_exists('auto_po_generation', $data) ? filter_var($data['auto_po_generation'], FILTER_VALIDATE_BOOLEAN) : $product->auto_po_generation,
        ]);

        return $product;
    }

    /**
     * Delete a product.
     *
     * @param  int  $id  Product ID
     */
    public function deleteProduct(int $id): bool
    {
        $product = Product::find($id);

        if (! $product) {
            return false;
        }

        // Delete image file from storage if it exists
        if ($product->image_url && Storage::disk('public')->exists($product->image_url)) {
            Storage::disk('public')->delete($product->image_url);
        }

        return (bool) $product->delete();
    }

    /**
     * Get products at or below their reorder point.
     *
     * @param  int  $perPage  Number of items per page
     */
    public function getLowStockProducts(int $perPage = 15): LengthAwarePaginator
    {
        return Product::with(['category', 'unit', 'stockLevels'])
            ->active()
            ->lowStock()
            ->orderBy('name')
            ->paginate($perPage);
    }
    /**
     * Generate a unique SKU.
     */
    private function generateUniqueSku(): string
    {
        do {
            $sku = 'PROD-' . strtoupper(Str::random(6));
        } while (Product::where('sku', $sku)->exists());

        return $sku;
    }
}
