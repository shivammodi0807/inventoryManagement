import axiosApi from "./axiosApi";
import { 
  Product, 
  Category, 
  Unit, 
  InventoryLog, 
  ProductFilters, 
  StockLevel 
} from "@/types/inventory";
import { PaginatedResponse } from "@/types";

/**
 * PRODUCTS
 */

export const getProducts = async (params?: ProductFilters & { page?: number; per_page?: number }): Promise<PaginatedResponse<Product>> => {
  const res = await axiosApi.get<PaginatedResponse<Product>>("/api/products", { params });
  return res.data;
};

export const getLowStockProducts = async (params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<Product>> => {
  const res = await axiosApi.get<PaginatedResponse<Product>>("/api/products/low-stock", { params });
  return res.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const res = await axiosApi.get<Product>(`/api/products/${id}`);
  return res.data;
};

export const createProduct = async (data: Partial<Product>): Promise<Product> => {
  const res = await axiosApi.post<Product>("/api/products", data);
  return res.data;
};

export const updateProduct = async (id: number, data: Partial<Product>): Promise<Product> => {
  const res = await axiosApi.put<Product>(`/api/products/${id}`, data);
  return res.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await axiosApi.delete(`/api/products/${id}`);
};

/**
 * STOCK OPERATIONS
 */

export interface AdjustStockPayload {
  warehouse_id: number;
  quantity: number;
  type: string;
  notes?: string;
}

export const adjustStock = async (productId: number, data: AdjustStockPayload): Promise<StockLevel> => {
  const res = await axiosApi.post<StockLevel>(`/api/products/${productId}/adjust`, data);
  return res.data;
};

export const getProductHistory = async (productId: number, params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<InventoryLog>> => {
  const res = await axiosApi.get<PaginatedResponse<InventoryLog>>(`/api/products/${productId}/history`, { params });
  return res.data;
};

/**
 * CATEGORIES
 */

export const getCategories = async (params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<Category>> => {
  const res = await axiosApi.get<PaginatedResponse<Category>>("/api/categories", { params });
  return res.data;
};

export const createCategory = async (data: Partial<Category>): Promise<Category> => {
  const res = await axiosApi.post<Category>("/api/categories", data);
  return res.data;
};

export const updateCategory = async (id: number, data: Partial<Category>): Promise<Category> => {
  const res = await axiosApi.put<Category>(`/api/categories/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await axiosApi.delete(`/api/categories/${id}`);
};

/**
 * UNITS
 */

export const getUnits = async (params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<Unit>> => {
  const res = await axiosApi.get<PaginatedResponse<Unit>>("/api/units", { params });
  return res.data;
};

export const createUnit = async (data: Partial<Unit>): Promise<Unit> => {
  const res = await axiosApi.post<Unit>("/api/units", data);
  return res.data;
};

export const updateUnit = async (id: number, data: Partial<Unit>): Promise<Unit> => {
  const res = await axiosApi.put<Unit>(`/api/units/${id}`, data);
  return res.data;
};

export const deleteUnit = async (id: number): Promise<void> => {
  await axiosApi.delete(`/api/units/${id}`);
};
