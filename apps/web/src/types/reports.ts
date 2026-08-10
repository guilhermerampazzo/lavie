export interface AffiliateReportRow {
  id: string;
  name: string;
  channel?: string | null;
  conversions: number;
  revenue: number;
  commissionTotal: number;
  commissionPending: number;
  roi: number | null;
}

export interface AffiliateReport {
  totalRevenue: number;
  totalCommissions: number;
  rows: AffiliateReportRow[];
}

export interface FinancialReport {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  commissions: number;
  expenses: number;
  receivables: number;
  netProfit: number;
  netMargin: number;
  marginByProduct: Array<{ nome: string; revenue: number; custo: number; margin: number }>;
}

export interface PeriodComparison {
  current: {
    from: string;
    to: string;
    totalOrders: number;
    totalRevenue: number;
    avgTicket: number;
    byChannel: Array<{ channel: string; total: number }>;
    byDay: Array<{ day: string; total: number }>;
  };
  previous: {
    from: string;
    to: string;
    totalOrders: number;
    totalRevenue: number;
    avgTicket: number;
    byChannel: Array<{ channel: string; total: number }>;
  };
  changes: {
    revenueChange: number | null;
    ordersChange: number | null;
    avgTicketChange: number | null;
  };
}
