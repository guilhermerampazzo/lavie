export type PaymentMethod = "boleto" | "pix" | "transferencia" | "credito_em_conta";
export type PaymentStatus = "pendente" | "pago" | "cancelado";

export interface PortalCatalogItem {
  id: string;
  nome: string;
  precoVarejo: number;
  precoRevenda: number;
  variants: Array<{ id: string; sku: string; estoque: number }>;
}

export interface PortalKit {
  id: string;
  name: string;
  description?: string | null;
  discountPct: number;
  total: number;
  price: number;
  items: Array<{ productId: string; nome: string; quantity: number; unitPrice: number }>;
}

export interface PortalCatalog {
  items: PortalCatalogItem[];
  minQuantity: number;
  kits: PortalKit[];
}

export interface PortalOrder {
  id: string;
  orderId: string | null;
  paymentMethod?: PaymentMethod | null;
  paymentStatus?: PaymentStatus;
  order: {
    id: string;
    status: string;
    total: string;
    createdAt: string;
    items: Array<{ id: string; name: string; sku: string; quantity: number; unitPrice: string }>;
  } | null;
}

export interface SupportMaterial {
  id: string;
  title: string;
  kind: "text" | "image" | "pdf";
  content: string;
  createdAt: string;
}
