import { Warehouse } from "@/types/warehouse";
import axiosApi from "./axiosApi";

export type WarehousePayload = {
  name: string;
  location?: string | null;
  is_active?: boolean;
};

export async function getWarehouses(isActive?: boolean): Promise<Warehouse[]> {
  const params = isActive !== undefined ? { is_active: isActive } : {};
  const response = await axiosApi.get("/api/warehouses", { params });
  return response.data.data as Warehouse[];
}

export async function getWarehouse(id: number): Promise<Warehouse> {
  const response = await axiosApi.get(`/api/warehouses/${id}`);
  return response.data.data as Warehouse;
}

export async function createWarehouse(data: WarehousePayload): Promise<Warehouse> {
  const response = await axiosApi.post("/api/warehouses", data);
  return response.data.data as Warehouse;
}

export async function updateWarehouse(id: number, data: Partial<WarehousePayload>): Promise<Warehouse> {
  const response = await axiosApi.patch(`/api/warehouses/${id}`, data);
  return response.data.data as Warehouse;
}

export async function deleteWarehouse(id: number): Promise<{ message: string; deactivated?: boolean }> {
  const response = await axiosApi.delete(`/api/warehouses/${id}`);
  return response.data;
}
