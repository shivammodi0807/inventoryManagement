import { Customer } from "./customer";

export interface SalesOrder {
  id: number;
  order_number: string;
  customer_id: number;
  customer?: Customer;
  order_date: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: string | number;
  tax_total: string | number;
  grand_total: string | number;
  shipping_address: string | null;
  notes: string | null;
  invoice?: Invoice;
  items?: SalesOrderItem[];
  created_at?: string;
  updated_at?: string;
}

export interface SalesOrderItem {
  id?: number;
  sales_order_id?: number;
  product_id: number;
  quantity: number;
  unit_price: string | number;
  subtotal?: string | number;
  warehouse_id?: number;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
  warehouse?: {
    id: number;
    name: string;
  };
}

export interface Payment {
  id: number;
  invoice_id: number;
  payment_date: string;
  payment_method: string;
  amount: string | number;
  transaction_id: string | null;
  notes: string | null;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  sales_order_id: number;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  due_date: string;
  total_amount: string | number;
  paid_amount: string | number;
  balance_due: string | number;
  payments?: Payment[];
  created_at?: string;
  updated_at?: string;
}

export interface SalesOrderFilters {
  search?: string;
  status?: string;
  customer_id?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
}

export interface InvoiceFilters {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

export interface SalesOrdersResponse {
  data: SalesOrder[];
  total: number;
  current_page: number;
  last_page: number;
}

export interface InvoicesResponse {
  data: Invoice[];
  total: number;
  current_page: number;
  last_page: number;
}
