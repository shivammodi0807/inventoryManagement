import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getSalesOrders, 
  getSalesOrder, 
  createSalesOrder, 
  confirmSalesOrder, 
  cancelSalesOrder,
  generateInvoice,
  recordPayment
} from "@/lib/sales";
import { toast } from "sonner";

export function useSalesOrders(filters: any = {}) {
  return useQuery({
    queryKey: ["sales-orders", filters],
    queryFn: () => getSalesOrders(filters),
  });
}

export function useSalesOrder(id: number) {
  return useQuery({
    queryKey: ["sales-order", id],
    queryFn: () => getSalesOrder(id),
    enabled: !!id,
  });
}

export function useCreateSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSalesOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      toast.success("Sales order created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create sales order");
    },
  });
}

export function useConfirmSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmSalesOrder,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      queryClient.invalidateQueries({ queryKey: ["sales-order", id] });
      toast.success("Sales order confirmed and stock deducted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to confirm sales order");
    },
  });
}

export function useCancelSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelSalesOrder,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      queryClient.invalidateQueries({ queryKey: ["sales-order", id] });
      toast.success("Sales order cancelled");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to cancel sales order");
    },
  });
}

export function useGenerateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateInvoice,
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["sales-order", orderId] });
      toast.success("Invoice generated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to generate invoice");
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: number; data: any }) => 
      recordPayment(invoiceId, data),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      // We might need to find which order this invoice belongs to to invalidate it
      queryClient.invalidateQueries({ queryKey: ["sales-order"] }); 
      toast.success("Payment recorded successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to record payment");
    },
  });
}
