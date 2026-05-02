import axiosApi from "./axiosApi";
import { DashboardStats } from "@/types/dashboard";

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await axiosApi.get("/api/dashboard/stats");
  return response.data.data;
}
