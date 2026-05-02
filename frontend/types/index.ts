// Roles are dynamic (admins can create new ones from Settings → Roles), so
// the name is just `string`. Only the two sealed roles are special: their
// ids are stable (1 = Admin, 2 = Guest) and the SealedRoleGuard forbids
// renaming them. Use `user.role.name === "Admin"` only for the sealed-admin
// badge — every other gate should go through `can(action, resource)`.
export interface Permission {
  id: number;
  action: string;
  resource: string;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  is_sealed?: boolean;
  is_admin?: boolean;
  is_guest?: boolean;
  user_count?: number;
  permissions?: Permission[];
}

// Format: `"action:resource"`, e.g. `"create:product"`. Drives the SPA
// `can()` helper. Backend: see App\Modules\Auth\Resources\UserResource.
export type PermissionString = `${string}:${string}`;

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  email_verified_at: string | null;
  last_login_at: string | null;
  role: Role;
  permissions: PermissionString[];
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
