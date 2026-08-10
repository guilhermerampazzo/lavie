export type StockMovementType =
  | "entrada"
  | "saida"
  | "consignacao_saida"
  | "consignacao_retorno"
  | "devolucao"
  | "ajuste";

export interface StockMovementItem {
  id: string;
  variantId: string;
  type: StockMovementType;
  quantity: number;
  reason?: string | null;
  createdAt: string;
}
