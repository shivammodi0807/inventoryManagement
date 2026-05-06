import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  WarehousePayload,
} from "@/lib/warehouse";
import { Warehouse } from "@/types/warehouse";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ApiError } from "@/types";

export function useWarehouses(isActive?: boolean) {
  return useQuery<Warehouse[]>({
    queryKey: ["warehouses", { isActive }],
    queryFn: () => getWarehouses(isActive),
  });
}

export function useWarehouse(id: number) {
  return useQuery<Warehouse>({
    queryKey: ["warehouse", id],
    queryFn: () => getWarehouse(id),
    enabled: !!id,
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Warehouse created successfully");
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message || "Failed to create warehouse");
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WarehousePayload> }) =>
      updateWarehouse(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse", id] });
      toast.success("Warehouse updated successfully");
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message || "Failed to update warehouse");
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWarehouse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      if (data.deactivated) {
        toast.warning("Warehouse has stock — it has been deactivated instead of deleted.");
      } else {
        toast.success("Warehouse deleted successfully");
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message || "Failed to delete warehouse");
    },
  });
}
