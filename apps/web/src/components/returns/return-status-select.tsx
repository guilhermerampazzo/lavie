"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";

const STATUS_OPTIONS = ["solicitada", "aprovada", "recusada", "concluida"] as const;

/** Atualiza o status de uma solicitação de troca/devolução. */
export function ReturnStatusSelect({
  returnId,
  initial,
}: {
  returnId: string;
  initial: string;
}) {
  const router = useRouter();
  const apiFetch = useApiClient();
  const [loading, setLoading] = useState(false);

  async function handleChange(status: string) {
    setLoading(true);
    try {
      await apiFetch(`/returns/${returnId}/status`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      toast.success("Status atualizado.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível atualizar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={initial}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value)}
      className="h-8 rounded-[9px] border border-line bg-surface px-2 text-[12px] outline-none focus:border-brand disabled:opacity-50"
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );
}
