<?php

namespace App\Modules\Inventory\Services;

use App\Models\Inventory\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class CategoryService
{
    /**
     * Get all categories with optional filtering and sorting.
     *
     * @param array $filters Optional filters (name, parent_id)
     * @param string $sortBy Column to sort by (default: name)
     * @param string $sortOrder Sort order (asc, desc)
     * @param int $perPage Number of items per page
     * @return LengthAwarePaginator
     */
    public function getCategories(
        array $filters = [],
        string $sortBy = 'name',
        string $sortOrder = 'asc',
        int $perPage = 15
    ): LengthAwarePaginator {
        $query = Category::withCount('children', 'products');

        // Apply name filter
        if (!empty($filters['name'])) {
            $query->where('name', 'like', "%{$filters['name']}%");
        }

        // Apply parent_id filter
        if (isset($filters['parent_id'])) {
            $query->where('parent_id', $filters['parent_id']);
        }

        // Apply sorting with validation
        $validColumns = ['id', 'name', 'created_at', 'updated_at'];
        $sortBy = in_array($sortBy, $validColumns) ? $sortBy : 'name';
        $sortOrder = strtolower($sortOrder) === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sortBy, $sortOrder)->paginate($perPage);
    }

    /**
     * Get a single category by ID with relationships.
     *
     * @param int $id Category ID
     * @return Category|null
     */
    public function getCategory(int $id): ?Category
    {
        return Category::withCount('children', 'products')
            ->with('parent')
            ->find($id);
    }

    /**
     * Get category hierarchy as tree structure.
     *
     * @return Collection
     */
    public function getCategoryTree(): Collection
    {
        return Category::whereNull('parent_id')
            ->withCount('children', 'products')
            ->with('children.children')
            ->orderBy('name')
            ->get();
    }

    /**
     * Create a new category.
     *
     * @param array $data Category data
     * @return Category
     */
    public function createCategory(array $data): Category
    {
        return Category::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'parent_id' => $data['parent_id'] ?? null,
        ]);
    }

    /**
     * Update a category.
     *
     * @param int $id Category ID
     * @param array $data Updated data
     * @return Category|null
     */
    public function updateCategory(int $id, array $data): ?Category
    {
        $category = Category::find($id);

        if (!$category) {
            return null;
        }

        $category->update([
            'name' => $data['name'] ?? $category->name,
            'description' => $data['description'] ?? $category->description,
            'parent_id' => $data['parent_id'] ?? $category->parent_id,
        ]);

        return $category;
    }

    /**
     * Delete a category and orphan its products.
     *
     * @param int $id Category ID
     * @return bool
     */
    public function deleteCategory(int $id): bool
    {
        $category = Category::find($id);

        if (!$category) {
            return false;
        }

        // Set products' category to null
        $category->products()->update(['category_id' => null]);

        // Delete the category
        return $category->delete();
    }

    /**
     * Check if a category has child categories.
     *
     * @param int $id Category ID
     * @return bool
     */
    public function hasChildren(int $id): bool
    {
        return Category::where('parent_id', $id)->exists();
    }

    /**
     * Move a category to a new parent.
     *
     * @param int $id Category ID
     * @param int|null $newParentId New parent ID or null for root
     * @return bool
     */
    public function moveCategory(int $id, ?int $newParentId): bool
    {
        // Prevent circular reference
        if ($newParentId && $this->isCategoryDescendantOf($newParentId, $id)) {
            return false;
        }

        return Category::where('id', $id)->update(['parent_id' => $newParentId]);
    }

    /**
     * Check if $checkId is a descendant of $ancestorId.
     *
     * @param int $checkId Category ID to check
     * @param int $ancestorId Potential ancestor ID
     * @return bool
     */
    private function isCategoryDescendantOf(int $checkId, int $ancestorId): bool
    {
        $category = Category::find($checkId);

        while ($category) {
            if ($category->id === $ancestorId) {
                return true;
            }

            $category = $category->parent;
        }

        return false;
    }
}
