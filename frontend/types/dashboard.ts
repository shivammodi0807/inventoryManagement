export interface DashboardKPIs {
  total_skus: number;
  total_stock_value: number;
  low_stock_count: number;
  open_po_count: number;
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

export interface DashboardStats {
  kpis: DashboardKPIs;
  charts: {
    stock_movements: StockMovement[];
    category_value: CategoryValue[];
  };
  widgets: {
    low_stock_items: LowStockItem[];
  };
}
