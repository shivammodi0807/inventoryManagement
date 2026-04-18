<?php

namespace App\Modules\Inventory\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Requests\ProductStoreRequest;
use App\Modules\Inventory\Requests\ProductUpdateRequest;
use App\Modules\Inventory\Resources\ProductResource;
use App\Modules\Inventory\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProductController extends Controller
{
    /**
     * Constructor to inject ProductService.
     */
    public function __construct(private ProductService $productService) {}

    /**
     * Display a listing of products (paginated).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = [
            'name' => $request->query('name'),
            'sku' => $request->query('sku'),
            'category_id' => $request->query('category_id'),
            'unit_id' => $request->query('unit_id'),
            'is_active' => $request->query('is_active'),
        ];

        $sortBy = $request->query('sort_by', 'name');
        $sortOrder = $request->query('sort_order', 'asc');
        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));

        $products = $this->productService->getProducts(
            $filters,
            $sortBy,
            $sortOrder,
            $perPage
        );

        return ProductResource::collection($products);
    }

    /**
     * Store a newly created product.
     */
    public function store(ProductStoreRequest $request): JsonResponse
    {
        $product = $this->productService->createProduct(
            $request->validated(),
            $request->user()->id
        );

        return response()->json(
            new ProductResource($product),
            Response::HTTP_CREATED
        );
    }

    /**
     * Display the specified product.
     */
    public function show(int $id): JsonResponse
    {
        $product = $this->productService->getProduct($id);

        if (! $product) {
            return response()->json(
                ['message' => 'Product not found'],
                Response::HTTP_NOT_FOUND
            );
        }

        return response()->json(new ProductResource($product));
    }

    /**
     * Update the specified product.
     */
    public function update(ProductUpdateRequest $request, int $id): JsonResponse
    {
        $product = $this->productService->updateProduct(
            $id,
            $request->validated()
        );

        if (! $product) {
            return response()->json(
                ['message' => 'Product not found'],
                Response::HTTP_NOT_FOUND
            );
        }

        return response()->json(
            new ProductResource($product),
            Response::HTTP_OK
        );
    }

    /**
     * Delete the specified product.
     */
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->productService->deleteProduct($id);

        if (! $deleted) {
            return response()->json(
                ['message' => 'Product not found'],
                Response::HTTP_NOT_FOUND
            );
        }

        return response()->json(
            ['message' => 'Product deleted successfully'],
            Response::HTTP_NO_CONTENT
        );
    }
}
