import { useQuery } from "@tanstack/react-query";
import axiosApi from "@/lib/axiosApi";
import { AuditLogReportItem, AuditLogsResponse, InventoryValuationReport, LowStockReportItem, InventoryForecastItem, SalesPerformanceReport, SupplierPerformanceReport } from "@/types/reports";

export function useInventoryValuation() {
  return useQuery<InventoryValuationReport>({
    queryKey: ["reports", "inventory-valuation"],
    queryFn: async () => {
      const response = await axiosApi.get("/api/reports/inventory-valuation");
      return response.data;
    },
  });
}

export function useSalesPerformance(period: string = "month", from?: string, to?: string) {
  return useQuery<SalesPerformanceReport>({
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
  return useQuery<LowStockReportItem[]>({
    queryKey: ["reports", "low-stock"],
    queryFn: async () => {
      const response = await axiosApi.get("/api/reports/low-stock");
      return response.data;
    },
  });
}

export function useAuditLogs(from?: string, to?: string, page: number = 1, perPage: number = 15) {
  return useQuery<AuditLogsResponse>({
    queryKey: ["reports", "audit-logs", from, to, page, perPage],
    queryFn: async () => {
      const response = await axiosApi.get("/api/reports/audit-logs", {
        params: { from, to, page, per_page: perPage }
      });
      return response.data;
    },
  });
}

export function useSupplierPerformance() {
  return useQuery<SupplierPerformanceReport>({
    queryKey: ["reports", "supplier-performance"],
    queryFn: async () => {
      const response = await axiosApi.get("/api/reports/supplier-performance");
      return response.data;
    },
  });
}

export function useInventoryForecast() {
  return useQuery<InventoryForecastItem[]>({
    queryKey: ["reports", "inventory-forecast"],
    queryFn: async () => {
      const response = await axiosApi.get("/api/reports/inventory-forecast");
      return response.data;
    },
  });
}

export function getReportExportUrl(type: string, params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return `${process.env.NEXT_PUBLIC_API_URL}/api/reports/export/${type}${query ? `?${query}` : ""}`;
}
