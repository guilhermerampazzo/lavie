import { MessageCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { ConversationList } from "@/components/atendimento/conversation-list";
import type { ConversationListItem } from "@/types/atendimento";

export default async function AtendimentoPage() {
  const session = await auth();
  const conversations = await apiServerFetch<ConversationListItem[]>("/conversations").catch(
    () => [] as ConversationListItem[],
  );

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="flex h-[calc(100vh-56px)]">
        <div className="w-full border-r border-line lg:w-[280px]">
          <div className="border-b border-line px-4 py-3">
            <h1 className="font-serif text-[17px] font-medium text-ink">Atendimento</h1>
          </div>
          {conversations.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={MessageCircle}
                title="Nenhuma conversa"
                description="Conversas do WhatsApp aparecem aqui quando o Evolution API estiver conectado."
              />
            </div>
          ) : (
            <ConversationList conversations={conversations} />
          )}
        </div>
        <div className="hidden flex-1 items-center justify-center text-[12.5px] text-muted-foreground lg:flex">
          Selecione uma conversa
        </div>
      </div>
    </AppShell>
  );
}
