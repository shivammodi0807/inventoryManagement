import { User } from "./index";

export interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: number;
  name: string;
  abbreviation: string;
  type: string | null;
  products_count?: number;
  created_at: string;
  updated_at: string;
}

export interface SupplierLink {
  id: number;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  supplier_sku: string | null;
  cost_price: string;
  est_delivery_days: number;
  is_preferred: boolean;
  min_order_qty: number;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category_id: number;
  category?: Category;
  unit_id: number;
  unit?: Unit;
  unit_price: string; // Decimal from Laravel is often string in JSON
  cost_price: string;
  reorder_point: number;
  reorder_quantity: number;
  lead_time_days: number;
  is_active: boolean;
  auto_po_generation: boolean;
  image_url: string | null;
  attributes: Record<string, any> | null;
  stock_levels?: StockLevel[];
  total_stock?: number; // Virtual attribute from backend
  stock_status?: 'critical' | 'low' | 'normal' | 'overstock'; // Virtual attribute
  suppliers?: SupplierLink[];
  created_at: string;
  updated_at: string;
  pivot?: import('./supplier').ProductSupplier;
}

export interface StockLevel {
  id: number;
  product_id: number;
  warehouse_id: number;
  total_stock: number;
  stock_reserved: number;
  current_stock: number;
  stock_verified_on: string | null;
  created_at: string;
  updated_at: string;
  warehouse?: {
    id: number;
    name: string;
    location: string | null;
    is_active: boolean;
  };
}

export interface InventoryLog {
  id: number;
  product_id: number;
  type: 'receipt' | 'sale' | 'adjustment' | 'transfer' | 'return' | 'damage';
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  notes: string | null;
  user_id: number;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  search?: string;
  category_id?: number;
  unit_id?: number;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  stock_status?: string;
}
