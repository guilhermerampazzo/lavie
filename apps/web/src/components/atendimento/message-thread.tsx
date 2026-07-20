"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";
import { cn } from "@/lib/utils";
import type { ConversationDetail } from "@/types/atendimento";

export function MessageThread({ conversation }: { conversation: ConversationDetail }) {
  const apiFetch = useApiClient();
  const router = useRouter();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!text.trim()) return;
    setSending(true);
    try {
      await apiFetch(`/conversations/${conversation.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: text }),
      });
      setText("");
      router.refresh();
    } catch {
      toast.error("Não foi possível enviar a mensagem.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[52px] items-center justify-between border-b border-line px-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand-dark">
            {conversation.contact.slice(-2)}
          </span>
          <span className="text-[13px] font-medium">{conversation.contact}</span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {conversation.channel === "whatsapp" ? "WhatsApp" : conversation.channel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-4">
        {conversation.messages.length === 0 ? (
          <p className="text-center text-[12.5px] text-muted-foreground">Nenhuma mensagem ainda.</p>
        ) : (
          conversation.messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[70%] rounded-xl px-3 py-2 text-[12.5px]",
                m.direction === "inbound"
                  ? "self-start border border-line bg-canvas"
                  : "self-end bg-brand text-white",
              )}
            >
              {m.content}
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-line p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Digite uma mensagem..."
          className="h-[34px] flex-1 rounded-lg border border-line px-3 text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        />
        <button
          type="button"
          disabled={sending}
          onClick={send}
          className="h-[34px] rounded-lg bg-brand px-3.5 text-[12px] font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {sending ? "Enviando…" : "Enviar"}
        </button>
      </div>
    </div>
  );
}
