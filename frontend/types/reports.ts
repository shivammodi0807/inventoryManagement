export interface AuditLogReportItem {
  id: number;
  created_at: string;
  product_name: string;
  change_type: string;
  quantity_change: number;
  new_stock: number;
  reason: string | null;
  user_name: string;
}

export interface AuditLogsResponse {
  data: AuditLogReportItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface InventoryValuationReport {
  totals: {
    stock: number;
    cost_value: number;
    retail_value: number;
    potential_profit: number;
  };
  breakdown: {
    category_id?: number | null;
    category_name: string | null;
    total_stock: number;
    total_cost_value: number;
    total_retail_value: number;
  }[];
}

export interface LowStockReportItem {
  id: number;
  sku: string;
  name: string;
  current_stock: number;
  total_stock: number;
  reorder_point: number;
  reorder_quantity: number;
  preferred_supplier?: string | null;
  supplier_email?: string | null;
}

export interface InventoryForecastItem {
  id: number;
  sku: string;
  name: string;
  current_stock: number;
  ai_safety_stock: number | null;
  ai_predicted_demand_30d: number;
  days_remaining: number;
  daily_velocity: number;
  estimated_stock_out: string;
  status: 'critical' | 'warning' | 'low' | 'out_of_stock' | 'healthy';
  chart_data: {
    date: string;
    demand: number;
    upper: number;
    lower: number;
  }[];
}

export interface SalesPerformanceReport {
  summary: {
    total_revenue: number;
    total_orders: number;
    avg_order_value: number;
  };
  daily_sales: {
    date: string;
    revenue: number;
  }[];
  top_products: {
    sku: string;
    name: string;
    units_sold: number;
    total_revenue: number | string;
  }[];
}

export interface SupplierPerformanceItem {
  id: number | string;
  name: string;
  total_orders: number;
  on_time_rate: number;
  fulfillment_rate: number;
  status: string;
}

export interface SupplierPerformanceSummary {
  avg_reliability: number;
  fulfillment_rate: number;
  avg_lead_time: number;
  total_vendors: number;
}

export interface TopPerformerSupplier {
  id: number | string;
  name: string;
  rating: number;
}

export interface SupplierPerformanceReport {
  suppliers: SupplierPerformanceItem[];
  summary: SupplierPerformanceSummary;
  top_performers: TopPerformerSupplier[];
}
