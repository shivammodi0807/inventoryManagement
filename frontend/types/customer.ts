export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CustomerFilters {
  search?: string;
  is_active?: boolean;
}

export interface CustomersResponse {
  data: Customer[];
  total: number;
  current_page: number;
  last_page: number;
}
