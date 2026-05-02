import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/dashboard";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard_stats"],
    queryFn: getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains foc
    refetchOnMount: false, // Don't refetch when component mounts 
    retry: 1, // Don't retry on failure
  });
}