export interface AppNotification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: {
    type: 'low_stock' | 'overstock' | 'purchase_order_received' | string;
    title: string;
    message: string;
    priority?: 'critical' | 'warning' | 'info';
    product_id?: number;
    action_url?: string;
    can_auto_po?: boolean;
    suggested_data?: {
      supplier_id: number;
      supplier_name: string;
      quantity: number;
      cost_price: string | number;
    };
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedNotifications {
  data: AppNotification[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  total_unread?: number;
}
