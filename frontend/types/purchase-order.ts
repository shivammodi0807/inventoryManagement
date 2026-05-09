import { Supplier } from "./supplier";
import { Product } from "./inventory";

export enum PurchaseOrderStatus {
  Draft = "draft",
  Submitted = "submitted",
  Confirmed = "confirmed",
  PartiallyReceived = "partially_received",
  Received = "received",
  Cancelled = "cancelled",
}

export interface PurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  product_id: number;
  qty_ordered: number;
  qty_received: number;
  cost_price: string;
  total_price: string;
  product?: Product;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_id: number;
  status: PurchaseOrderStatus;
  order_date: string;
  exp_delivery: string | null;
  description: string | null;
  total_amount: string;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderFilters {
  status?: PurchaseOrderStatus | "pending";
  supplier_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface StorePurchaseOrderItem {
  product_id: number;
  qty_ordered: number;
  cost_price: number | string;
}

export interface StorePurchaseOrderPayload {
  supplier_id: number;
  order_date: string; // YYYY-MM-DD
  exp_delivery?: string | null; // YYYY-MM-DD
  description?: string;
  items: StorePurchaseOrderItem[];
}

export type UpdatePurchaseOrderPayload = Partial<StorePurchaseOrderPayload>;

export interface ReceivePurchaseOrderItem {
  item_id: number;
  qty_received: number;
}

export interface ReceivePurchaseOrderPayload {
  warehouse_id: number;
  items: ReceivePurchaseOrderItem[];
}

export interface PurchaseOrdersResponse {
  data: PurchaseOrder[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
