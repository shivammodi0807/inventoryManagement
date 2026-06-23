import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getSalesOrders, 
  getSalesOrder, 
  createSalesOrder, 
  confirmSalesOrder, 
  cancelSalesOrder,
  shipSalesOrder,
  deliverSalesOrder,
  generateInvoice,
  recordPayment,
  exportInvoice,
  getInvoices,
  getInvoiceStats
} from "@/lib/sales";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ApiError } from "@/types";
import { SalesOrderFilters, InvoiceFilters, SalesOrder, SalesOrdersResponse } from "@/types/sales";

export function useSalesOrders(filters: SalesOrderFilters = {}) {
  return useQuery<SalesOrdersResponse>({
    queryKey: ["sales-orders", filters],
    queryFn: () => getSalesOrders(filters),
  });
}

export function useInvoices(filters: InvoiceFilters = {}) {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: () => getInvoices(filters),
  });
}

export function useInvoiceStats() {
  return useQuery({
    queryKey: ["invoice-stats"],
    queryFn: getInvoiceStats,
  });
}

export function useSalesOrder(id: number) {
  return useQuery<SalesOrder>({
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
    onError: (error: AxiosError<ApiError>) => {
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
    onError: (error: AxiosError<ApiError>) => {
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
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message || "Failed to cancel sales order");
    },
  });
}

export function useShipSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: shipSalesOrder,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      queryClient.invalidateQueries({ queryKey: ["sales-order", id] });
      toast.success("Sales order marked as shipped");
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message || "Failed to ship sales order");
    },
  });
}

export function useDeliverSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deliverSalesOrder,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      queryClient.invalidateQueries({ queryKey: ["sales-order", id] });
      toast.success("Sales order marked as delivered");
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message || "Failed to deliver sales order");
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
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message || "Failed to generate invoice");
    },
  });
}

export function useExportInvoice() {
  return useMutation({
    mutationFn: exportInvoice,
    onSuccess: (blob, invoiceId) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `INV-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded successfully");
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message || "Failed to download invoice");
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: number; data: { amount: number; payment_method: string; notes?: string } }) => 
      recordPayment(invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      // We might need to find which order this invoice belongs to to invalidate it
      queryClient.invalidateQueries({ queryKey: ["sales-order"] }); 
      toast.success("Payment recorded successfully");
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message || "Failed to record payment");
    },
  });
}
