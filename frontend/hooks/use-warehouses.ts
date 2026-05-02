import { useQuery } from "@tanstack/react-query";
import { getWarehouses } from "@/lib/warehouse";

export function useWarehouses(isActive?: boolean) {
  return useQuery({
    queryKey: ["warehouses", { isActive }],
    queryFn: () => getWarehouses(isActive),
  });
}
