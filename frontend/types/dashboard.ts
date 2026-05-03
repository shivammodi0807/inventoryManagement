export interface DashboardKPIs {
  total_skus: number;
  total_stock_value: number;
  low_stock_count: number;
  open_po_count: number;
  monthly_sales: number;
  pending_sales_count: number;
  total_logs_count: number;
}

export interface StockMovement {
  date: string;
  received: number;
  issued: number;
}

export interface CategoryValue {
  name: string;
  value: number;
}

export interface LowStockItem {
  id: number;
  name: string;
  sku: string;
  reorder_point: number;
  category_name: string | null;
  total_stock: number;
}

export interface RecentActivity {
  id: number;
  product_name: string;
  user_name: string | null;
  change_type: string;
  quantity_change: number;
  created_at: string;
}

export interface DashboardStats {
  kpis: DashboardKPIs;
  charts: {
    stock_movements: StockMovement[];
    category_value: CategoryValue[];
  };
  widgets: {
    low_stock_items: LowStockItem[];
    recent_activity: RecentActivity[];
  };
}
