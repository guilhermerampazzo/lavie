export interface ConversationMessage {
  id: string;
  direction: "inbound" | "outbound";
  content: string;
  createdAt: string;
}

export interface ConversationListItem {
  id: string;
  channel: string;
  contact: string;
  status: "aberta" | "em_atendimento" | "resolvida";
  assignedTo?: string | null;
  updatedAt: string;
  messages: ConversationMessage[];
}

export interface ConversationCustomer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  segments: string[];
  whatsappVip?: boolean;
  totalSpent: number;
  lastOrderAt?: string | null;
  loyaltyPoints: number;
}

export interface ConversationDetail extends Omit<ConversationListItem, "messages"> {
  messages: ConversationMessage[];
  customer?: ConversationCustomer | null;
}

export interface ProductSuggestion {
  product: { id: string; nome: string; preco: number; estoque: number };
  motivo: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
}

export interface MessageTemplateItem {
  id: string;
  name: string;
  trigger: string;
  content: string;
  active: boolean;
}
