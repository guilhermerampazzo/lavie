export interface PortalCatalogItem {
  id: string;
  nome: string;
  precoVarejo: number;
  precoRevenda: number;
  variants: Array<{ id: string; sku: string; estoque: number }>;
}

export interface PortalOrder {
  id: string;
  orderId: string | null;
  order: {
    id: string;
    status: string;
    total: string;
    createdAt: string;
    items: Array<{ id: string; name: string; sku: string; quantity: number; unitPrice: string }>;
  } | null;
}
