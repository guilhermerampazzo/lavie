import { Heart } from "lucide-react";
import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import type { Affiliate } from "@/types/people";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AfiliadasPage() {
  const session = await auth();
  const affiliates = await apiServerFetch<Affiliate[]>("/affiliates").catch(() => [] as Affiliate[]);
  const commissionPending = affiliates.reduce((sum, a) => sum + a.commissionPending, 0);

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5">
          <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Afiliadas e influenciadoras</h1>
          <p className="text-[12.5px] text-muted-foreground">
            {affiliates.length} cadastradas · {formatBRL(commissionPending)} em comissões pendentes
          </p>
        </div>

        {affiliates.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Nenhuma afiliada cadastrada"
            description="Cadastre influenciadoras e parceiras para acompanhar links de rastreio e comissões."
          />
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-xl border border-line lg:block">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Afiliada</th>
                    <th className="px-3 py-2 font-medium">Canal</th>
                    <th className="px-3 py-2 text-right font-medium">Conversões</th>
                    <th className="px-3 py-2 text-right font-medium">Receita gerada</th>
                    <th className="px-3 py-2 text-right font-medium">ROI</th>
                    <th className="px-3 py-2 text-right font-medium">Comissão pendente</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliates.map((a) => (
                    <tr key={a.id} className="border-b border-line/60 last:border-0">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand-dark">
                            {a.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                          </span>
                          <span>
                            <span className="block font-medium text-ink">{a.handle ?? a.name}</span>
                            <span className="block text-[11px] text-muted-foreground">
                              {a.channel ?? "-"} {a.followers ? `· ${a.followers.toLocaleString("pt-BR")} seguidores` : ""}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{a.channel ?? "-"}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{a.conversions}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatBRL(a.revenue)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {a.roi !== null ? (
                          <span className="font-medium text-success">{a.roi.toFixed(1)}x</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatBRL(a.commissionPending)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2.5 lg:hidden">
              {affiliates.map((a) => (
                <div key={a.id} className="rounded-xl border border-line bg-surface p-3">
                  <div className="mb-2 flex items-center gap-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand-dark">
                      {a.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{a.handle ?? a.name}</span>
                      <span className="block text-[11px] text-muted-foreground">{a.channel ?? "-"}</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-[12px] text-muted-foreground">
                    <span>{a.conversions} conversões</span>
                    <span className="font-medium text-ink">{formatBRL(a.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
