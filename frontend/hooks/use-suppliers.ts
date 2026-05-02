import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getSuppliers, 
  getSupplier, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier,
  getSupplierPerformance,
  linkProductToSupplier,
  unlinkProductFromSupplier
} from "@/lib/supplier";
import { SupplierFilters, Supplier, LinkProductPayload } from "@/types/supplier";
import { toast } from "sonner";

export function useSuppliers(filters: SupplierFilters = {}) {
  return useQuery({
    queryKey: ["suppliers", filters],
    queryFn: () => getSuppliers(filters),
  });
}

export function useSupplier(id: number) {
  return useQuery({
    queryKey: ["supplier", id],
    queryFn: () => getSupplier(id),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create supplier");
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Supplier> }) => 
      updateSupplier(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["supplier", id] });
      toast.success("Supplier updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update supplier");
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier deactivated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to deactivate supplier");
    },
  });
}

export function useSupplierPerformance(id: number) {
  return useQuery({
    queryKey: ["supplier-performance", id],
    queryFn: () => getSupplierPerformance(id),
    enabled: !!id,
  });
}

export function useLinkProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ supplierId, data }: { supplierId: number; data: LinkProductPayload }) =>
      linkProductToSupplier(supplierId, data),
    onSuccess: (_, { supplierId }) => {
      queryClient.invalidateQueries({ queryKey: ["supplier", supplierId] });
      toast.success("Product linked successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to link product");
    },
  });
}

export function useUnlinkProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ supplierId, productId }: { supplierId: number; productId: number }) =>
      unlinkProductFromSupplier(supplierId, productId),
    onSuccess: (_, { supplierId }) => {
      queryClient.invalidateQueries({ queryKey: ["supplier", supplierId] });
      toast.success("Product unlinked successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to unlink product");
    },
  });
}
