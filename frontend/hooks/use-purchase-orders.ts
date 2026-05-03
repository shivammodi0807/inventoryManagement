import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  submitPurchaseOrder,
  confirmPurchaseOrder,
  cancelPurchaseOrder,
  receivePurchaseOrder,
  exportPurchaseOrder
} from "@/lib/purchase-orders";
import { 
  PurchaseOrderFilters, 
  StorePurchaseOrderPayload, 
  UpdatePurchaseOrderPayload,
  ReceivePurchaseOrderPayload
} from "@/types/purchase-order";

export function usePurchaseOrders(filters: PurchaseOrderFilters = {}) {
  return useQuery({
    queryKey: ["purchase-orders", filters],
    queryFn: () => getPurchaseOrders(filters),
  });
}

export function usePurchaseOrder(id: number) {
  return useQuery({
    queryKey: ["purchase-order", id],
    queryFn: () => getPurchaseOrder(id),
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StorePurchaseOrderPayload) => createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("Purchase order created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create purchase order");
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePurchaseOrderPayload }) => updatePurchaseOrder(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      const orderId = data?.data?.id || data?.id;
      if (orderId) queryClient.invalidateQueries({ queryKey: ["purchase-order", orderId] });
      toast.success("Purchase order updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update purchase order");
    },
  });
}

export function useSubmitPurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => submitPurchaseOrder(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      const orderId = data?.data?.id || data?.id;
      if (orderId) queryClient.invalidateQueries({ queryKey: ["purchase-order", orderId] });
      toast.success("Purchase order submitted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit purchase order");
    },
  });
}

export function useConfirmPurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => confirmPurchaseOrder(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      const orderId = data?.data?.id || data?.id;
      if (orderId) queryClient.invalidateQueries({ queryKey: ["purchase-order", orderId] });
      toast.success("Purchase order confirmed successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to confirm purchase order");
    },
  });
}

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelPurchaseOrder(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      const orderId = data?.data?.id || data?.id;
      if (orderId) queryClient.invalidateQueries({ queryKey: ["purchase-order", orderId] });
      toast.success("Purchase order cancelled successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to cancel purchase order");
    },
  });
}

export function useReceivePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReceivePurchaseOrderPayload }) => receivePurchaseOrder(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      const orderId = data?.data?.id || data?.id;
      if (orderId) queryClient.invalidateQueries({ queryKey: ["purchase-order", orderId] });
      // Invalidate stock/products as well since we just received inventory
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Stock received successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to receive stock");
    },
  });
}

export function useExportPurchaseOrder() {
  return useMutation({
    mutationFn: (id: number) => exportPurchaseOrder(id),
    onSuccess: (blob, id) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `PO-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF exported successfully");
    },
    onError: () => {
      toast.error("Failed to export PDF");
    },
  });
}
