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
}
