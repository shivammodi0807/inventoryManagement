import {
  PurchaseOrder,
  PurchaseOrderFilters,
  StorePurchaseOrderPayload,
  UpdatePurchaseOrderPayload,
  ReceivePurchaseOrderPayload,
  PurchaseOrdersResponse,
} from "@/types/purchase-order";
import axiosApi from "./axiosApi";

export async function getPurchaseOrders(filters: PurchaseOrderFilters = {}): Promise<PurchaseOrdersResponse> {
  const response = await axiosApi.get("/api/purchase-orders", {
    params: filters,
  });
  return response.data;
}

export async function getPurchaseOrder(
  id: number,
): Promise<{ data: PurchaseOrder }> {
  const response = await axiosApi.get(`/api/purchase-orders/${id}`);
  return response.data;
}

export async function createPurchaseOrder(
  data: StorePurchaseOrderPayload,
): Promise<{ data: PurchaseOrder }> {
  const response = await axiosApi.post("/api/purchase-orders", data);
  return response.data;
}

export async function updatePurchaseOrder(
  id: number,
  data: UpdatePurchaseOrderPayload,
): Promise<{ data: PurchaseOrder }> {
  const response = await axiosApi.patch(`/api/purchase-orders/${id}`, data);
  return response.data;
}

export async function submitPurchaseOrder(
  id: number,
): Promise<{ data: PurchaseOrder }> {
  const response = await axiosApi.patch(`/api/purchase-orders/${id}/submit`);
  return response.data;
}

export async function confirmPurchaseOrder(
  id: number,
): Promise<{ data: PurchaseOrder }> {
  const response = await axiosApi.patch(`/api/purchase-orders/${id}/confirm`);
  return response.data;
}

export async function cancelPurchaseOrder(
  id: number,
): Promise<{ data: PurchaseOrder }> {
  const response = await axiosApi.patch(`/api/purchase-orders/${id}/cancel`);
  return response.data;
}

export async function receivePurchaseOrder(
  id: number,
  data: ReceivePurchaseOrderPayload,
): Promise<{ data: PurchaseOrder }> {
  const response = await axiosApi.post(
    `/api/purchase-orders/${id}/receive`,
    data,
  );
  return response.data;
}

export async function exportPurchaseOrder(id: number) {
  const response = await axiosApi.get(`/api/purchase-orders/${id}/export`, {
    responseType: "blob",
  });
  return response.data;
}

export async function quickCreatePurchaseOrder(data: {
  supplier_id: number;
  product_id: number;
  quantity: number;
  cost_price: string | number;
}) {
  const response = await axiosApi.post("/api/purchase-orders/quick-create", data);
  return response.data;
}

export async function bulkCreatePurchaseOrders(selections: { product_id: number; qty_to_order: number }[]) {
  const response = await axiosApi.post("/api/purchase-orders/bulk", { selections });
  return response.data;
}
