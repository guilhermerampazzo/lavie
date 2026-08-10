import { RotateCcw } from "lucide-react";
import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { ReturnStatusSelect } from "@/components/returns/return-status-select";
import type { ReturnRequestItem } from "@/types/returns";

export default async function TrocasPage() {
  const session = await auth();
  const returns = await apiServerFetch<ReturnRequestItem[]>("/returns").catch(() => [] as ReturnRequestItem[]);

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5">
          <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Trocas e devoluções</h1>
          <p className="text-[12.5px] text-muted-foreground">
            Solicitações feitas pelas revendedoras no portal
          </p>
        </div>

        {returns.length === 0 ? (
          <EmptyState
            icon={RotateCcw}
            title="Nenhuma solicitação"
            description="Solicitações de troca/devolução feitas pelas revendedoras no portal aparecem aqui."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {returns.map((r) => (
              <div key={r.id} className="rounded-xl border border-line bg-surface p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-ink">{r.reseller?.name ?? "Revendedora"}</span>
                    <span className="text-[11.5px] text-muted-foreground">
                      Pedido #{r.orderId.slice(-6)} · {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <ReturnStatusSelect returnId={r.id} initial={r.status} />
                </div>
                <p className="whitespace-pre-line text-[12.5px] text-muted-foreground">{r.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
