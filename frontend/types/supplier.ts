import { Product } from "./inventory";

export interface Supplier {
  id: number;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  payment_terms: string | null;
  rating: string; // Decimal from Laravel is often string in JSON
  is_active: boolean;
  products_count?: number;
  products?: Product[];
  created_at: string;
  updated_at: string;
}

export interface SupplierFilters {
  search?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface ProductSupplier {
  supplier_sku: string | null;
  cost_price: string;
  est_delivery_days: number | null;
  is_preferred: boolean;
  min_order_qty: number;
}
