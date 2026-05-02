import axiosApi from "./axiosApi";
import { Supplier, SupplierFilters } from "@/types/supplier";
import { PaginatedResponse } from "@/types";

export async function getSuppliers(params: SupplierFilters = {}): Promise<PaginatedResponse<Supplier>> {
  const response = await axiosApi.get("/api/suppliers", { params });
  return response.data;
}

export async function getSupplier(id: number): Promise<Supplier> {
  const response = await axiosApi.get(`/api/suppliers/${id}`);
  return response.data;
}

export async function createSupplier(data: Partial<Supplier>): Promise<Supplier> {
  const response = await axiosApi.post("/api/suppliers", data);
  return response.data;
}

export async function updateSupplier(id: number, data: Partial<Supplier>): Promise<Supplier> {
  const response = await axiosApi.put(`/api/suppliers/${id}`, data);
  return response.data;
}

export async function deleteSupplier(id: number): Promise<void> {
  await axiosApi.delete(`/api/suppliers/${id}`);
}

export async function getSupplierPerformance(id: number): Promise<unknown> {
  const response = await axiosApi.get(`/api/suppliers/${id}/performance`);
  return response.data as unknown;
}
