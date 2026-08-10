"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";

/** Toggle de Grupo VIP (WhatsApp) na ficha do cliente. */
export function VipToggle({
  customerId,
  initial,
}: {
  customerId: string;
  initial: boolean;
}) {
  const router = useRouter();
  const apiFetch = useApiClient();
  const [checked, setChecked] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function toggle(next: boolean) {
    setLoading(true);
    setChecked(next);
    try {
      await apiFetch(`/customers/${customerId}`, {
        method: "PUT",
        body: JSON.stringify({ whatsappVip: next }),
      });
      toast.success(next ? "Cliente marcado no Grupo VIP." : "Removido do Grupo VIP.");
      router.refresh();
    } catch (err) {
      setChecked(!next);
      toast.error(err instanceof Error ? err.message : "Não foi possível atualizar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => toggle(!checked)}
      className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
        checked
          ? "border-brand bg-brand text-white"
          : "border-line bg-surface text-muted-foreground hover:border-brand/50"
      }`}
    >
      <span className={`size-1.5 rounded-full ${checked ? "bg-white" : "bg-current"}`} />
      {checked ? "Grupo VIP ✓" : "Marcar no Grupo VIP"}
    </button>
  );
}
