import { useQuery } from "@tanstack/react-query";
import { getProducts, getProduct } from "@/lib/inventory";
import { ProductFilters, Product } from "@/types/inventory";
import { PaginatedResponse } from "@/types";

export function useProducts(filters: ProductFilters & { page?: number; per_page?: number } = {}) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
  });
}

export function useProduct(id: number) {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });
}
