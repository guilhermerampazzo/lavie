import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { apiServerFetch, ApiError } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { ConversationList } from "@/components/atendimento/conversation-list";
import { MessageThread } from "@/components/atendimento/message-thread";
import type { ConversationListItem, ConversationDetail } from "@/types/atendimento";

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const [conversations, conversation] = await Promise.all([
    apiServerFetch<ConversationListItem[]>("/conversations").catch(() => [] as ConversationListItem[]),
    apiServerFetch<ConversationDetail>(`/conversations/${params.id}`).catch((err) => {
      if (err instanceof ApiError && err.status === 404) notFound();
      throw err;
    }),
  ]);

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="flex h-[calc(100vh-56px)]">
        <div className="hidden w-[280px] border-r border-line lg:block">
          <div className="border-b border-line px-4 py-3">
            <h1 className="font-serif text-[17px] font-medium text-ink">Atendimento</h1>
          </div>
          <ConversationList conversations={conversations} activeId={conversation.id} />
        </div>
        <div className="flex-1">
          <MessageThread conversation={conversation} />
        </div>
      </div>
    </AppShell>
  );
}
