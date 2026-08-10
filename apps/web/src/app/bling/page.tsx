import { FileText, Wallet, TrendingUp, AlertTriangle } from "lucide-react";
import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { BlingSyncButton } from "@/components/bling/bling-sync-button";
import type { BlingDashboard } from "@/types/bling";

function formatBRL(value: number | string) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function BlingPage() {
  const session = await auth();
  const data = await apiServerFetch<BlingDashboard>("/bling/dashboard").catch(() => null);

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Bling (ERP)</h1>
            <p className="text-[12.5px] text-muted-foreground">
              Notas fiscais e financeiro sincronizados — tudo visível aqui, sem abrir o Bling
            </p>
          </div>
          <BlingSyncButton />
        </div>

        {!data ? (
          <EmptyState
            icon={AlertTriangle}
            title="Não foi possível carregar o Bling"
            description="Verifique se a API está no ar e tente novamente."
          />
        ) : !data.connection.connected ? (
          <div className="rounded-xl border border-warning/40 bg-warning/5 p-6">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="size-4 text-warning" />
              <p className="text-[13px] font-medium text-ink">Bling não conectado</p>
            </div>
            <p className="text-[12.5px] text-muted-foreground">
              {data.connection.error ??
                "Conecte o Bling em Configurações para sincronizar NFs, contas a receber e a pagar automaticamente."}
            </p>
            <a
              href="/configuracoes"
              className="mt-3 inline-block rounded-btn border border-brand px-3 py-1.5 text-[12px] font-medium text-brand-dark hover:bg-brand-soft/50"
            >
              Ir para Configurações
            </a>
          </div>
        ) : (
          <>
            {/* Resumo financeiro */}
            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-xl border border-line p-4">
                <p className="mb-1 flex items-center gap-1.5 text-[10.5px] uppercase tracking-wide text-muted-foreground">
                  <FileText className="size-3" /> NF-e emitidas
                </p>
                <p className="font-serif text-[22px] font-medium tabular-nums text-ink">
                  {data.invoices.emitted}
                </p>
                <p className="text-[10.5px] text-muted-foreground">
                  {data.invoices.drafts} rascunho(s) · {data.invoices.total} no total
                </p>
              </div>
              <div className="rounded-xl border border-line p-4">
                <p className="mb-1 flex items-center gap-1.5 text-[10.5px] uppercase tracking-wide text-muted-foreground">
                  <Wallet className="size-3" /> A receber (aberto)
                </p>
                <p className="font-serif text-[22px] font-medium tabular-nums text-success">
                  {formatBRL(data.summary.aReceber)}
                </p>
              </div>
              <div className="rounded-xl border border-line p-4">
                <p className="mb-1 flex items-center gap-1.5 text-[10.5px] uppercase tracking-wide text-muted-foreground">
                  <Wallet className="size-3" /> A pagar (aberto)
                </p>
                <p className="font-serif text-[22px] font-medium tabular-nums text-danger">
                  {formatBRL(data.summary.aPagar)}
                </p>
              </div>
              <div className="rounded-xl border border-line p-4">
                <p className="mb-1 flex items-center gap-1.5 text-[10.5px] uppercase tracking-wide text-muted-foreground">
                  <TrendingUp className="size-3" /> Saldo previsto
                </p>
                <p className="font-serif text-[22px] font-medium tabular-nums text-ink">
                  {formatBRL(data.summary.saldoPrevisto)}
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* NFs */}
              <div className="rounded-xl border border-line p-4">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Notas fiscais (Bling)
                </p>
                {data.invoices.items.length === 0 ? (
                  <p className="py-6 text-center text-[12px] text-muted-foreground">
                    Nenhuma NF sincronizada ainda — clique em &ldquo;Sincronizar do Bling&rdquo;.
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {data.invoices.items.slice(0, 10).map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between text-[12px]">
                        <span className="text-muted-foreground">NF {inv.number ?? inv.blingInvoiceId ?? inv.id.slice(-6)}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                              inv.status === "emitida"
                                ? "bg-success/10 text-success"
                                : inv.status === "cancelada"
                                  ? "bg-danger/10 text-danger"
                                  : "bg-warning/10 text-warning"
                            }`}
                          >
                            {inv.status}
                          </span>
                          <span className="tabular-nums font-medium">{formatBRL(inv.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contas */}
              <div className="rounded-xl border border-line p-4">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Contas a receber (Bling)
                </p>
                {data.receivables.items.length === 0 ? (
                  <p className="py-6 text-center text-[12px] text-muted-foreground">
                    Nenhuma conta a receber sincronizada ainda.
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {data.receivables.items.slice(0, 10).map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-[12px]">
                        <span className="max-w-[60%] truncate text-muted-foreground">{c.description}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10.5px] text-muted-foreground">
                            {new Date(c.dueDate).toLocaleDateString("pt-BR")}
                          </span>
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                              c.status === "paga"
                                ? "bg-success/10 text-success"
                                : c.status === "atrasada"
                                  ? "bg-danger/10 text-danger"
                                  : "bg-warning/10 text-warning"
                            }`}
                          >
                            {c.status}
                          </span>
                          <span className="tabular-nums font-medium">{formatBRL(c.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="mt-4 text-[11px] text-muted-foreground">
              Sincronize periodicamente para manter NFs e contas atualizadas. A integração completa (pedidos, estoque)
              será refinada conforme o uso do Bling na operação.
            </p>
          </>
        )}
      </div>
    </AppShell>
  );
}
