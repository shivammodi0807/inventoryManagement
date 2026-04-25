export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  category_id: number;
  category?: Category;
  unit_price: number;
  cost_price: number;
  reorder_point: number;
  reorder_quantity: number;
  lead_time_days: number;
  created_at?: string;
  updated_at?: string;
}

export interface Supplier {
  id: number;
  company_name: string;
  contact_person?: string;
  email: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_id: number;
  supplier?: Supplier;
  status: 'draft' | 'submitted' | 'confirmed' | 'received' | 'cancelled';
  order_date?: string;
  expected_delivery_date?: string;
  total_amount: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
