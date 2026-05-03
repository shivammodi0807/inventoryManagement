import { useQuery } from "@tanstack/react-query";
import axiosApi from "@/lib/axiosApi";

export function useInventoryValuation() {
  return useQuery({
    queryKey: ["reports", "inventory-valuation"],
    queryFn: async () => {
      const response = await axiosApi.get("/api/reports/inventory-valuation");
      return response.data;
    },
  });
}

export function useSalesPerformance(period: string = "month", from?: string, to?: string) {
  return useQuery({
    queryKey: ["reports", "sales-performance", period, from, to],
    queryFn: async () => {
      const response = await axiosApi.get("/api/reports/sales-performance", {
        params: { period, from, to },
      });
      return response.data;
    },
  });
}

export function useLowStockReport() {
  return useQuery({
    queryKey: ["reports", "low-stock"],
    queryFn: async () => {
      const response = await axiosApi.get("/api/reports/low-stock");
      return response.data;
    },
  });
}

export function useAuditLogs(from?: string, to?: string) {
  return useQuery({
    queryKey: ["reports", "audit-logs", from, to],
    queryFn: async () => {
      const response = await axiosApi.get("/api/reports/audit-logs", {
        params: { from, to }
      });
      return response.data;
    },
  });
}

export function useSupplierPerformance() {
  return useQuery({
    queryKey: ["reports", "supplier-performance"],
    queryFn: async () => {
      const response = await axiosApi.get("/api/reports/supplier-performance");
      return response.data;
    },
  });
}

export function useInventoryForecast() {
  return useQuery({
    queryKey: ["reports", "inventory-forecast"],
    queryFn: async () => {
      const response = await axiosApi.get("/api/reports/inventory-forecast");
      return response.data;
    },
  });
}

export function getReportExportUrl(type: string, params: any = {}) {
  const query = new URLSearchParams(params).toString();
  return `${process.env.NEXT_PUBLIC_API_URL}/api/reports/export/${type}${query ? `?${query}` : ""}`;
}
