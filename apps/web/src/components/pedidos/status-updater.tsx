"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";

const FLOW: Record<string, string | null> = {
  novo: "pago",
  pago: "em_separacao",
  em_separacao: "embalado",
  embalado: "enviado",
  enviado: "entregue",
  entregue: null,
  cancelado: null,
};

const NEXT_LABEL: Record<string, string> = {
  pago: "Marcar como pago",
  em_separacao: "Iniciar separação",
  embalado: "Marcar como embalado",
  enviado: "Marcar como enviado",
  entregue: "Marcar como entregue",
};

export function StatusUpdater({ orderId, status }: { orderId: string; status: string }) {
  const apiFetch = useApiClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const next = FLOW[status];
  if (!next) return null;

  async function advance() {
    setLoading(true);
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: next }),
      });
      toast.success("Status atualizado.");
      router.refresh();
    } catch {
      toast.error("Não foi possível atualizar o status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      disabled={loading}
      onClick={advance}
      className="rounded-btn bg-brand text-white hover:bg-brand-dark"
    >
      {loading ? "Atualizando…" : NEXT_LABEL[next as string]}
    </Button>
  );
}
