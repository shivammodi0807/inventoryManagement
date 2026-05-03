import { useQuery } from "@tanstack/react-query";
import { getProducts, getProduct } from "@/lib/inventory";
import { ProductFilters } from "@/types/inventory";

export function useProducts(filters: ProductFilters & { page?: number; per_page?: number } = {}) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });
}
