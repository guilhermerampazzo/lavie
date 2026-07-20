export interface DashboardMetrics {
  revenue: number;
  avgTicket: number;
  ordersCount: number;
  byChannel: Array<{ channel: string; total: number }>;
  resellerRanking: Array<{ name: string; total: number }>;
}

export interface DashboardAlert {
  id: string;
  severity: "warning" | "danger";
  message: string;
  href?: string;
}

export interface OrderListItem {
  id: string;
  status: string;
  channel: string;
  total: string;
  createdAt: string;
  customer?: { name: string } | null;
}

export interface SalesReport {
  totalOrders: number;
  totalRevenue: number;
  byChannel: Array<{ channel: string; total: number }>;
  byCategory: Array<{ category: string; total: number }>;
  byDay: Array<{ day: string; total: number }>;
}
