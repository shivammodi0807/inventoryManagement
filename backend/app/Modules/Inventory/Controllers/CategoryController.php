<?php

namespace App\Modules\Inventory\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Requests\CategoryStoreRequest;
use App\Modules\Inventory\Requests\CategoryUpdateRequest;
use App\Modules\Inventory\Resources\CategoryResource;
use App\Modules\Inventory\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class CategoryController extends Controller
{
    /**
     * Constructor to inject CategoryService.
     */
    public function __construct(private CategoryService $categoryService) {}

    /**
     * Display a listing of categories (paginated).
     *
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = [
            'name' => $request->query('name'),
            'parent_id' => $request->query('parent_id'),
        ];

        $sortBy = $request->query('sort_by', 'name');
        $sortOrder = $request->query('sort_order', 'asc');
        $perPage = max(1, min(100, (int)$request->query('per_page', 15)));

        $categories = $this->categoryService->getCategories(
            $filters,
            $sortBy,
            $sortOrder,
            $perPage
        );

        return CategoryResource::collection($categories);
    }

    /**
     * Get category hierarchy as tree structure.
     *
     * @return JsonResponse
     */
    public function tree(): JsonResponse
    {
        $tree = $this->categoryService->getCategoryTree();

        return response()->json([
            'data' => CategoryResource::collection($tree),
            'message' => 'Category tree retrieved successfully',
        ]);
    }

    /**
     * Store a newly created category.
     *
     * @param CategoryStoreRequest $request
     * @return JsonResponse
     */
    public function store(CategoryStoreRequest $request): JsonResponse
    {
        $category = $this->categoryService->createCategory(
            $request->validated()
        );

        return response()->json(
            new CategoryResource($category),
            Response::HTTP_CREATED
        );
    }

    /**
     * Display the specified category.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $category = $this->categoryService->getCategory($id);

        if (!$category) {
            return response()->json(
                ['message' => 'Category not found'],
                Response::HTTP_NOT_FOUND
            );
        }

        return response()->json(new CategoryResource($category));
    }

    /**
     * Update the specified category.
     *
     * @param CategoryUpdateRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(CategoryUpdateRequest $request, int $id): JsonResponse
    {
        $category = $this->categoryService->updateCategory(
            $id,
            $request->validated()
        );

        if (!$category) {
            return response()->json(
                ['message' => 'Category not found'],
                Response::HTTP_NOT_FOUND
            );
        }

        return response()->json(
            new CategoryResource($category),
            Response::HTTP_OK
        );
    }

    /**
     * Delete the specified category.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->categoryService->deleteCategory($id);

        if (!$deleted) {
            return response()->json(
                ['message' => 'Category not found'],
                Response::HTTP_NOT_FOUND
            );
        }

        return response()->json(
            ['message' => 'Category deleted successfully'],
            Response::HTTP_NO_CONTENT
        );
    }
}
