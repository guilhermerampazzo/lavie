"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";

/** Gera o snapshot automático de relatórios (agendado semanal, manual sob demanda). */
export function SnapshotButton() {
  const router = useRouter();
  const apiFetch = useApiClient();
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      await apiFetch("/reports/snapshot/generate", { method: "POST" });
      toast.success("Snapshot de relatórios gerado.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível gerar o snapshot.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      className="rounded-btn border-line"
      disabled={loading}
      onClick={handleGenerate}
      title="Gera o resumo semanal de vendas/afiliadas/financeiro"
    >
      {loading ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <CalendarClock className="mr-1.5 size-3.5" />}
      Gerar resumo
    </Button>
  );
}
