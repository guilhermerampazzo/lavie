export interface BlingInvoiceItem {
  id: string;
  blingInvoiceId?: string | null;
  number?: string | null;
  status: string;
  total: string;
  issueDate?: string | null;
  orderId?: string | null;
}

export interface BlingAccountItem {
  id: string;
  type: string;
  description: string;
  amount: string;
  dueDate: string;
  status: string;
  paidAt?: string | null;
}

export interface BlingDashboard {
  connection: { connected: boolean; error?: string | null };
  invoices: {
    total: number;
    emitted: number;
    drafts: number;
    items: BlingInvoiceItem[];
  };
  receivables: { totalOpen: number; items: BlingAccountItem[] };
  payables: { totalOpen: number; items: BlingAccountItem[] };
  summary: {
    aReceber: number;
    aPagar: number;
    saldoPrevisto: number;
  };
}
