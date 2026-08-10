"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";

/** Solicitação de troca/devolução de um pedido do portal (escopofinal.md 7.4). */
export function ReturnRequestButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const apiFetch = useApiClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (reason.trim().length < 5) {
      toast.error("Descreva o motivo (mín. 5 caracteres).");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/portal/returns", {
        method: "POST",
        body: JSON.stringify({
          orderId,
          reason: reason.trim(),
          items: [],
        }),
      });
      toast.success("Solicitação de troca/devolução enviada.");
      setOpen(false);
      setReason("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível enviar a solicitação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!open ? (
        <Button
          type="button"
          variant="outline"
          className="h-7 rounded-btn border-line px-2 text-[11px]"
          onClick={() => setOpen(true)}
        >
          <RotateCcw className="mr-1 size-3" /> Troca / devolução
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2 rounded-lg border border-line bg-canvas p-3">
          <textarea
            className="min-h-16 w-full rounded-[9px] border border-line bg-surface p-2 text-[12px] outline-none focus:border-brand"
            placeholder="Motivo da troca/devolução…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="submit" className="h-7 flex-1 rounded-btn bg-brand text-white hover:bg-brand-dark" disabled={loading}>
              {loading && <Loader2 className="mr-1 size-3 animate-spin" />}
              Enviar solicitação
            </Button>
            <Button type="button" variant="outline" className="h-7 rounded-btn border-line" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
