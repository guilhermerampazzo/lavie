"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Link2 } from "lucide-react";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";

/** Sincroniza os dados do Bling para o painel (NFs + contas). */
export function BlingSyncButton() {
  const router = useRouter();
  const apiFetch = useApiClient();
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    setLoading(true);
    try {
      const result = await apiFetch<{
        invoices?: { created: number; total: number };
        receivables?: { created: number; total: number };
        payables?: { created: number; total: number };
        error?: string;
      }>("/bling/sync", { method: "POST" });

      if (result.error) {
        toast.error(result.error);
      } else {
        const created =
          (result.invoices?.created ?? 0) +
          (result.receivables?.created ?? 0) +
          (result.payables?.created ?? 0);
        toast.success(
          `Bling sincronizado: ${result.invoices?.total ?? 0} NFs, ${result.receivables?.total ?? 0} contas a receber, ${result.payables?.total ?? 0} a pagar (${created} novas).`,
        );
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível sincronizar o Bling.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href="/configuracoes"
        className="flex h-8 items-center gap-1.5 rounded-btn border border-line px-3 text-[12px] font-medium text-muted-foreground hover:bg-brand-soft/40"
      >
        <Link2 className="size-3.5" /> Conectar / configurar
      </a>
      <Button
        variant="outline"
        className="rounded-btn border-line"
        disabled={loading}
        onClick={handleSync}
      >
        {loading ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 size-3.5" />}
        Sincronizar do Bling
      </Button>
    </div>
  );
}
