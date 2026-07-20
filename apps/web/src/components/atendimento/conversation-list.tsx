import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ConversationListItem } from "@/types/atendimento";

export function ConversationList({
  conversations,
  activeId,
}: {
  conversations: ConversationListItem[];
  activeId?: string;
}) {
  return (
    <div className="flex flex-col overflow-y-auto">
      {conversations.map((c) => {
        const last = c.messages[0];
        const initials = c.contact.slice(-2);
        return (
          <Link
            key={c.id}
            href={`/atendimento/${c.id}`}
            className={cn(
              "flex items-center gap-2.5 border-b border-line px-3.5 py-2.5",
              c.id === activeId && "bg-brand-soft",
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand-dark">
              {initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink">
                {c.contact}
                {c.status === "aberta" && <span className="size-1.5 rounded-full bg-success" />}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {last?.content ?? "Sem mensagens"}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
