"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send, Sparkles, UserRound, UserRoundPlus } from "lucide-react";
import { useApiClient } from "@/lib/api-client-browser";
import { cn } from "@/lib/utils";
import type { ConversationDetail, ProductSuggestion } from "@/types/atendimento";

function formatBRL(value: number | string) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function MessageThread({
  conversation,
  team,
}: {
  conversation: ConversationDetail;
  team?: Array<{ id: string; name: string }>;
}) {
  const apiFetch = useApiClient();
  const router = useRouter();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[] | null>(null);
  const [assigning, setAssigning] = useState(false);

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

  async function suggest() {
    setSuggesting(true);
    setSuggestions(null);
    try {
      const result = await apiFetch<{ recommendations: ProductSuggestion[] }>(
        `/conversations/${conversation.id}/suggest-products`,
        { method: "POST" },
      );
      setSuggestions(result.recommendations);
      if (result.recommendations.length === 0) {
        toast.info("A IA não encontrou sugestões com o contexto atual.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível gerar sugestões.");
    } finally {
      setSuggesting(false);
    }
  }

  async function sendSuggestion(product: ProductSuggestion["product"], motivo: string) {
    const content = `✨ *Sugestão para você*: ${product.nome} — ${formatBRL(product.preco)}\n${motivo}`;
    setSending(true);
    try {
      await apiFetch(`/conversations/${conversation.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      setSuggestions(null);
      router.refresh();
    } catch {
      toast.error("Não foi possível enviar a sugestão.");
    } finally {
      setSending(false);
    }
  }

  async function assign(userId: string) {
    setAssigning(true);
    try {
      await apiFetch(`/conversations/${conversation.id}`, {
        method: "PUT",
        body: JSON.stringify({ assignedTo: userId }),
      });
      toast.success("Conversa transferida.");
      router.refresh();
    } catch {
      toast.error("Não foi possível transferir.");
    } finally {
      setAssigning(false);
    }
  }

  const customer = conversation.customer as ConversationDetail["customer"];

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[52px] items-center justify-between border-b border-line px-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand-dark">
            {conversation.contact.slice(-2)}
          </span>
          <span className="text-[13px] font-medium">{customer?.name ?? conversation.contact}</span>
          {customer?.whatsappVip && (
            <span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand-dark">
              VIP
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">
            {conversation.channel === "whatsapp" ? "WhatsApp" : conversation.channel}
          </span>
          {team && team.length > 0 && (
            <select
              value={conversation.assignedTo ?? ""}
              disabled={assigning}
              onChange={(e) => e.target.value && assign(e.target.value)}
              className="h-7 rounded-lg border border-line bg-surface px-1.5 text-[11px] outline-none focus:border-brand disabled:opacity-50"
              title="Transferir conversa"
            >
              <option value="">Atendente…</option>
              {team.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Mensagens */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-4">
            {conversation.messages.length === 0 ? (
              <p className="text-center text-[12.5px] text-muted-foreground">Nenhuma mensagem ainda.</p>
            ) : (
              conversation.messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[70%] whitespace-pre-line rounded-xl px-3 py-2 text-[12.5px]",
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

          {suggestions && suggestions.length > 0 && (
            <div className="border-t border-line bg-brand-soft/30 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-brand-dark">
                <Sparkles className="size-3" /> Sugestões da IA
              </p>
              <div className="flex flex-col gap-2">
                {suggestions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium text-ink">{s.product.nome}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{s.motivo}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[12px] font-medium tabular-nums">{formatBRL(s.product.preco)}</span>
                      <button
                        type="button"
                        disabled={sending}
                        onClick={() => sendSuggestion(s.product, s.motivo)}
                        className="rounded-lg bg-brand px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-brand-dark disabled:opacity-50"
                      >
                        <Send className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-line p-3">
            <button
              type="button"
              disabled={suggesting}
              onClick={suggest}
              className="flex h-[34px] items-center gap-1 rounded-lg border border-brand/40 px-2.5 text-[11.5px] font-medium text-brand-dark hover:bg-brand-soft/50 disabled:opacity-50"
              title="Sugerir produtos com IA"
            >
              {suggesting ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
              <span className="hidden sm:inline">Sugerir</span>
            </button>
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

        {/* Ficha do cliente (identificação automática) */}
        <div className="hidden w-[220px] shrink-0 border-l border-line p-4 lg:block">
          <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
            {customer ? <UserRound className="size-3" /> : <UserRoundPlus className="size-3" />} Cliente
          </p>
          {customer ? (
            <div className="flex flex-col gap-2 text-[11.5px]">
              <p className="font-medium text-ink">{customer.name}</p>
              <p className="text-muted-foreground">{customer.phone}</p>
              {customer.email && <p className="break-all text-muted-foreground">{customer.email}</p>}
              <div className="flex flex-wrap gap-1">
                {customer.segments.map((s) => (
                  <span key={s} className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[9.5px] capitalize text-brand-dark">
                    {s.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
              <div className="mt-1 border-t border-line pt-2">
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Total gasto</span>
                  <span className="font-medium tabular-nums">{formatBRL(customer.totalSpent)}</span>
                </p>
                {customer.lastOrderAt && (
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Último pedido</span>
                    <span className="tabular-nums">{new Date(customer.lastOrderAt).toLocaleDateString("pt-BR")}</span>
                  </p>
                )}
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Pontos</span>
                  <span className="tabular-nums">{customer.loyaltyPoints}</span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Nenhum cliente com este telefone. A ficha aparece automaticamente quando o número estiver cadastrado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
