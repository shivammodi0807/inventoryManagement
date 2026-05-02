import { Warehouse } from "@/types/warehouse";
import axiosApi from "./axiosApi";

export async function getWarehouses(isActive?: boolean): Promise<Warehouse[]> {
  const params = isActive !== undefined ? { is_active: isActive } : {};
  const response = await axiosApi.get("/api/warehouses", { params });
  return response.data.data as Warehouse[];
}
