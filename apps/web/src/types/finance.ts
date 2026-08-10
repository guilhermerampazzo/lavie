export type AccountType = "receivable" | "payable";
export type AccountStatus = "aberta" | "paga" | "atrasada";

export interface AccountItem {
  id: string;
  type: AccountType;
  description: string;
  amount: string;
  dueDate: string;
  status: AccountStatus;
  paidAt?: string | null;
}

export interface CashFlowMonth {
  month: string;
  receivables: number;
  payables: number;
  balance: number;
}
