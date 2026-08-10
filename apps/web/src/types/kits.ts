export interface ResellerKit {
  id: string;
  name: string;
  description?: string | null;
  discountPct: string;
  active: boolean;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    product?: { id: string; nomeGerado: string } | null;
  }>;
}
