export type CustomerSegment = "vip" | "fiel" | "novo" | "a_reativar" | "aniversariante" | "carrinho_abandonado";

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: string;
}

export interface Order {
  id: string;
  status: string;
  channel: string;
  total: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  city?: string | null;
  state?: string | null;
  birthDate?: string | null;
  notes?: string | null;
  segments: CustomerSegment[];
  ordersCount: number;
  totalSpent: number;
  loyaltyPoints?: { points: number } | null;
  orders?: Order[];
  createdAt: string;
}

export interface TrackingLink {
  id: string;
  couponCode?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
  clicks: number;
  conversions: number;
}

export interface Commission {
  id: string;
  amount: string;
  status: "pendente" | "aprovado" | "pago";
  createdAt: string;
  order?: Order | null;
}

export interface Affiliate {
  id: string;
  name: string;
  handle?: string | null;
  channel?: string | null;
  followers?: number | null;
  email?: string | null;
  phone?: string | null;
  trackingLinks: TrackingLink[];
  commissions: Commission[];
  conversions: number;
  revenue: number;
  commissionTotal: number;
  commissionPending: number;
  roi: number | null;
}

export interface Reseller {
  id: string;
  name: string;
  document?: string | null;
  partnerType?: string | null;
  city?: string | null;
  state?: string | null;
  status: "pendente" | "aprovada" | "bloqueada";
  balance: string;
  lat?: number | null;
  lng?: number | null;
  createdAt: string;
}
