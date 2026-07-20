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

export interface ConversationDetail extends Omit<ConversationListItem, "messages"> {
  messages: ConversationMessage[];
}

export interface MessageTemplateItem {
  id: string;
  name: string;
  trigger: string;
  content: string;
  active: boolean;
}
