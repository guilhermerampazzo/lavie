"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export interface SyncJobItem {
  id: string;
  type: string;
  status: "pending" | "running" | "success" | "failed";
  error?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  createdAt: string;
}

const STATUS_LABEL: Record<SyncJobItem["status"], { label: string; cls: string }> = {
  pending: { label: "Na fila", cls: "bg-[#e6f0f5] text-[#2b5f7a]" },
  running: { label: "Rodando", cls: "bg-warning/10 text-warning" },
  success: { label: "Concluído", cls: "bg-success/10 text-success" },
  failed: { label: "Falhou", cls: "bg-danger/10 text-danger" },
};

export function SyncPanel({ jobs, disabled }: { jobs: SyncJobItem[]; disabled: boolean }) {
  const apiFetch = useApiClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function syncAll() {
    setLoading(true);
    try {
      await apiFetch("/settings/sync", { method: "POST", body: JSON.stringify({ entity: "all" }) });
      toast.success("Sincronização iniciada — acompanhe o status abaixo.");
      router.refresh();
    } catch {
      toast.error("Não foi possível iniciar a sincronização.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Sincronizar com a Nuvemshop
        </p>
        <Button
          type="button"
          disabled={loading || disabled}
          onClick={syncAll}
          className="rounded-btn bg-brand text-white hover:bg-brand-dark"
        >
          <RefreshCw className={loading ? "mr-1.5 size-3.5 animate-spin" : "mr-1.5 size-3.5"} />
          {loading ? "Iniciando…" : "Sincronizar tudo"}
        </Button>
      </div>

      {disabled && (
        <p className="mb-3 text-[11.5px] text-warning">
          Configure NUVEMSHOP_STORE_ID e NUVEMSHOP_ACCESS_TOKEN no .env para habilitar a sincronização.
        </p>
      )}

      <p className="mb-3 text-[11.5px] text-muted-foreground">
        Traz produtos, clientes, pedidos e cupons já existentes na loja para dentro do CRM. Pode ser
        rodado quantas vezes forem necessárias — cada entidade é atualizada pelo ID da Nuvemshop, sem duplicar.
      </p>

      {jobs.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">Nenhuma sincronização executada ainda.</p>
      ) : (
        <div className="flex flex-col">
          {jobs.map((j) => {
            const status = STATUS_LABEL[j.status];
            return (
              <div key={j.id} className="flex items-center justify-between border-b border-line/60 py-2 text-[12px] last:border-0">
                <div>
                  <span className="font-medium">{j.type.replace("nuvemshop:", "")}</span>
                  {j.error && <span className="ml-2 text-muted-foreground">{j.error}</span>}
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-medium ${status.cls}`}>
                  <span className="size-1.5 rounded-full bg-current" />
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
