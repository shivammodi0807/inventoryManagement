
import { Customer, CustomerFilters, CustomersResponse } from "@/types/customer";
import { SalesOrder, SalesOrderFilters, SalesOrdersResponse, Invoice, InvoiceFilters, InvoicesResponse } from "@/types/sales";
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
export async function getSalesOrders(filters: SalesOrderFilters = {}): Promise<SalesOrdersResponse> {
  const response = await axiosApi.get("/api/sales/orders", { params: filters });
  return response.data;
}

export async function getSalesOrder(id: number): Promise<SalesOrder> {
  const response = await axiosApi.get(`/api/sales/orders/${id}`);
  return response.data;
}

export async function createSalesOrder(data: Partial<SalesOrder>): Promise<SalesOrder> {
  const response = await axiosApi.post("/api/sales/orders", data);
  return response.data;
}

export async function confirmSalesOrder(id: number): Promise<SalesOrder> {
  const response = await axiosApi.post(`/api/sales/orders/${id}/confirm`);
  return response.data;
}

export async function cancelSalesOrder(id: number): Promise<SalesOrder> {
  const response = await axiosApi.post(`/api/sales/orders/${id}/cancel`);
  return response.data;
}

export async function shipSalesOrder(id: number): Promise<SalesOrder> {
  const response = await axiosApi.post(`/api/sales/orders/${id}/ship`);
  return response.data;
}

export async function deliverSalesOrder(id: number): Promise<SalesOrder> {
  const response = await axiosApi.post(`/api/sales/orders/${id}/deliver`);
  return response.data;
}

// Invoices & Payments
export async function generateInvoice(orderId: number): Promise<Invoice> {
  const response = await axiosApi.post(`/api/sales/orders/${orderId}/invoice`);
  return response.data;
}

export async function recordPayment(invoiceId: number, data: { amount: number; payment_method: string; notes?: string }): Promise<unknown> {
  const response = await axiosApi.post(`/api/sales/invoices/${invoiceId}/payments`, data);
  return response.data;
}

export async function exportInvoice(invoiceId: number) {
  const response = await axiosApi.get(`/api/sales/invoices/${invoiceId}/export`, {
    responseType: "blob",
  });
  return response.data;
}

export async function getInvoices(filters: InvoiceFilters = {}): Promise<InvoicesResponse> {
  const response = await axiosApi.get("/api/sales/invoices", { params: filters });
  return response.data;
}

export async function getInvoiceStats(): Promise<{total: number, unpaid: number, overdue: number, paid: number}> {
  const response = await axiosApi.get("/api/sales/invoices/stats");
  return response.data;
}

export function getInvoicePdfUrl(invoiceId: number): string {
  return `${process.env.NEXT_PUBLIC_API_URL}/api/sales/invoices/${invoiceId}/export`;
}
