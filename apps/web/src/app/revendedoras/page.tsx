import { Store } from "lucide-react";
import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { ApproveActions } from "@/components/revendedoras/approve-actions";
import type { Reseller } from "@/types/people";

function formatBRL(value: string | number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function RevendedorasPage() {
  const session = await auth();
  const resellers = await apiServerFetch<Reseller[]>("/resellers").catch(() => [] as Reseller[]);
  const pending = resellers.filter((r) => r.status === "pendente");
  const active = resellers.filter((r) => r.status !== "pendente");

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5">
          <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Revendedoras e lojas parceiras</h1>
          <p className="text-[12.5px] text-muted-foreground">
            {active.length} ativas · {pending.length} aguardando aprovação
          </p>
        </div>

        {resellers.length === 0 ? (
          <EmptyState
            icon={Store}
            title="Nenhuma revendedora cadastrada"
            description="Cadastros de revendedoras e lojas parceiras aparecem aqui para aprovação."
          />
        ) : (
          <>
            {pending.length > 0 && (
              <div className="mb-6">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Pendentes de aprovação
                </p>
                <div className="flex flex-col gap-2">
                  {pending.map((r) => (
                    <div
                      key={r.id}
                      className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-3.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand-dark">
                          {r.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                        </span>
                        <div>
                          <p className="text-[13px] font-medium text-ink">{r.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {r.document ?? "sem documento"} · {[r.city, r.state].filter(Boolean).join("/") || "-"}
                          </p>
                        </div>
                      </div>
                      <ApproveActions resellerId={r.id} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {active.length > 0 && (
              <div className="hidden overflow-hidden rounded-xl border border-line lg:block">
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Revendedora</th>
                      <th className="px-3 py-2 font-medium">Cidade</th>
                      <th className="px-3 py-2 text-right font-medium">Saldo</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.map((r) => (
                      <tr key={r.id} className="border-b border-line/60 last:border-0">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand-dark">
                              {r.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                            </span>
                            <span className="font-medium">{r.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {[r.city, r.state].filter(Boolean).join("/") || "-"}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{formatBRL(r.balance)}</td>
                        <td className="px-3 py-2.5">
                          <span
                            className={
                              r.status === "aprovada"
                                ? "inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success"
                                : "inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-medium text-danger"
                            }
                          >
                            <span className="size-1.5 rounded-full bg-current" />
                            {r.status === "aprovada" ? "Ativa" : "Bloqueada"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-col gap-2.5 lg:hidden">
              {active.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[12px] font-semibold text-brand-dark">
                    {r.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink">{r.name}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {[r.city, r.state].filter(Boolean).join("/") || "-"} · {formatBRL(r.balance)}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
