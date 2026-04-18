<?php

namespace App\Modules\Inventory\Services;

use App\Models\Inventory\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductService
{
    /**
     * Get all products with optional filtering and sorting.
     *
     * @param  array  $filters  Optional filters (name, sku, category_id, unit_id, is_active)
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
            $query->where('is_active', (bool) $filters['is_active']);
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
        return Product::with(['category', 'unit', 'creator'])->find($id);
    }

    /**
     * Create a new product.
     *
     * @param  array  $data  Product data
     * @param  int  $userId  Authenticated user ID (creator)
     */
    public function createProduct(array $data, int $userId): Product
    {
        return Product::create([
            'sku' => $data['sku'],
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
            'image_url' => $data['image_url'] ?? null,
            'is_active' => $data['is_active'] ?? true,
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
            'image_url' => array_key_exists('image_url', $data) ? $data['image_url'] : $product->image_url,
            'is_active' => array_key_exists('is_active', $data) ? (bool) $data['is_active'] : $product->is_active,
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

        return (bool) $product->delete();
    }
}
