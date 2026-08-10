export interface DashboardMetrics {
  revenue: number;
  prevRevenue: number;
  revenueChange: number | null;
  avgTicket: number;
  prevAvgTicket: number;
  avgTicketChange: number | null;
  ordersCount: number;
  prevOrdersCount: number;
  ordersChange: number | null;
  conversionRate: number;
  byChannel: Array<{ channel: string; total: number }>;
  topProductsByVolume: Array<{ nome: string; qty: number; revenue: number }>;
  topProductsByMargin: Array<{ nome: string; revenue: number; custo: number; margin: number }>;
  resellerRanking: Array<{ name: string; total: number }>;
  commissionsToPay: number;
  affiliateCommissionRanking: Array<{ name: string; total: number }>;
}

export interface StockMetrics {
  totalUnits: number;
  totalProducts: number;
  byCategory: Array<{ category: string; total: number }>;
  stagnant: Array<{ days: number; count: number }>;
  critical: Array<{ id: string; nome: string; estoque: number; minimo: number }>;
  criticalCount: number;
  turnover: Array<{ nome: string; vendas: number; estoque: number; giro: number }>;
  byLocation: Array<{ location: string; units: number }>;
}

export interface AffiliateRankingItem {
  id: string;
  name: string;
  channel?: string | null;
  conversions: number;
  revenue: number;
  commissionTotal: number;
  roi: number | null;
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
