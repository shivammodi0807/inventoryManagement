
import { Customer, CustomerFilters, CustomersResponse } from "@/types/customer";
import axiosApi from "./axiosApi";

// Customers
export async function getCustomers(filters: CustomerFilters = {}): Promise<CustomersResponse> {
  const response = await axiosApi.get("/api/sales/customers", { params: filters });
  return response.data;
}

export async function getCustomer(id: number): Promise<Customer> {
  const response = await axiosApi.get(`/api/sales/customers/${id}`);
  return response.data;
}

export async function createCustomer(data: Partial<Customer>): Promise<Customer> {
  const response = await axiosApi.post("/api/sales/customers", data);
  return response.data;
}

export async function updateCustomer(id: number, data: Partial<Customer>): Promise<Customer> {
  const response = await axiosApi.put(`/api/sales/customers/${id}`, data);
  return response.data;
}

export async function deleteCustomer(id: number): Promise<void> {
  await axiosApi.delete(`/api/sales/customers/${id}`);
}

// Sales Orders
export async function getSalesOrders(filters: any = {}): Promise<any> {
  const response = await axiosApi.get("/api/sales/orders", { params: filters });
  return response.data;
}

export async function getSalesOrder(id: number): Promise<any> {
  const response = await axiosApi.get(`/api/sales/orders/${id}`);
  return response.data;
}

export async function createSalesOrder(data: any): Promise<any> {
  const response = await axiosApi.post("/api/sales/orders", data);
  return response.data;
}

export async function confirmSalesOrder(id: number): Promise<any> {
  const response = await axiosApi.post(`/api/sales/orders/${id}/confirm`);
  return response.data;
}

export async function cancelSalesOrder(id: number): Promise<any> {
  const response = await axiosApi.post(`/api/sales/orders/${id}/cancel`);
  return response.data;
}

// Invoices & Payments
export async function generateInvoice(orderId: number): Promise<any> {
  const response = await axiosApi.post(`/api/sales/orders/${orderId}/invoice`);
  return response.data;
}

export async function recordPayment(invoiceId: number, data: any): Promise<any> {
  const response = await axiosApi.post(`/api/sales/invoices/${invoiceId}/payments`, data);
  return response.data;
}

export function getInvoicePdfUrl(invoiceId: number): string {
  return `${process.env.NEXT_PUBLIC_API_URL}/api/sales/invoices/${invoiceId}/export`;
}
