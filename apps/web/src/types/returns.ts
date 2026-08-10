export type ReturnStatus = "solicitada" | "aprovada" | "recusada" | "concluida";

export interface ReturnRequestItem {
  id: string;
  resellerId: string;
  orderId: string;
  reason: string;
  status: ReturnStatus;
  createdAt: string;
  reseller?: { name: string } | null;
  order?: { id: string; total: string; createdAt: string } | null;
}
