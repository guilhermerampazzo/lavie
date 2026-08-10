import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RevenueLineChart } from "@/components/dashboard/line-chart";
import { ExportButton } from "@/components/relatorios/export-button";
import { SnapshotButton } from "@/components/relatorios/snapshot-button";
import { PeriodCompareSelector } from "@/components/relatorios/period-compare-selector";
import { ComparePanel } from "@/components/relatorios/compare-panel";
import type { SalesReport } from "@/types/dashboard";
import type { AffiliateReport, FinancialReport, PeriodComparison } from "@/types/reports";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: { tab?: string; from?: string; to?: string; compareFrom?: string; compareTo?: string };
}) {
  const session = await auth();
  const tab = (searchParams.tab ?? "vendas") as "vendas" | "afiliadas" | "financeiro";
  const { from, to, compareFrom, compareTo } = searchParams;

  const range = (from && to ? `?from=${from}&to=${to}` : "");
  const compareRange =
    compareFrom && compareTo ? `&compareFrom=${compareFrom}&compareTo=${compareTo}` : "";

  const [sales, affiliates, financial, comparison] = await Promise.all([
    apiServerFetch<SalesReport>(`/reports/sales${range}`).catch(
      () => ({ totalOrders: 0, totalRevenue: 0, byChannel: [], byCategory: [], byDay: [] }) as SalesReport,
    ),
    apiServerFetch<AffiliateReport>("/reports/affiliates").catch(
      () => ({ totalRevenue: 0, totalCommissions: 0, rows: [] }) as AffiliateReport,
    ),
    apiServerFetch<FinancialReport>("/reports/financial").catch(
      () =>
        ({
          revenue: 0, cogs: 0, grossProfit: 0, grossMargin: 0, commissions: 0,
          expenses: 0, receivables: 0, netProfit: 0, netMargin: 0, marginByProduct: [],
        }) as FinancialReport,
    ),
    compareFrom && compareTo
      ? apiServerFetch<PeriodComparison>(`/reports/compare${range}${compareRange}`).catch(() => null)
      : Promise.resolve(null),
  ]);

  const TABS = [
    { value: "vendas", label: "Vendas" },
    { value: "afiliadas", label: "Afiliadas" },
    { value: "financeiro", label: "Financeiro" },
  ] as const;

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Relatórios</h1>
            <p className="text-[12.5px] text-muted-foreground">Vendas, afiliadas e financeiro do mês</p>
          </div>
          <div className="flex items-center gap-2">
            <SnapshotButton />
            <ExportButton tab={tab} />
          </div>
        </div>

        {/* Abas */}
        <div className="mb-3 flex overflow-hidden rounded-lg border border-line">
          {TABS.map((t) => (
            <a
              key={t.value}
              href={`/relatorios?tab=${t.value}`}
              className={`flex-1 border-r border-line px-3 py-2 text-center text-[12px] font-medium last:border-r-0 ${
                tab === t.value ? "bg-brand-soft text-brand-dark" : "text-muted-foreground hover:bg-brand-soft/30"
              }`}
            >
              {t.label}
            </a>
          ))}
        </div>

        <div className="mb-5">
          <PeriodCompareSelector tab={tab} from={from} to={to} compareFrom={compareFrom} compareTo={compareTo} />
        </div>

        {comparison && <ComparePanel comparison={comparison} />}

        {tab === "vendas" && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
              <div className="rounded-xl border border-line p-4">
                <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">Pedidos</p>
                <p className="font-serif text-[22px] font-medium tabular-nums text-ink">{sales.totalOrders}</p>
              </div>
              <div className="rounded-xl border border-line p-4">
                <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">Faturamento</p>
                <p className="font-serif text-[22px] font-medium tabular-nums text-ink">{formatBRL(sales.totalRevenue)}</p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-xl border border-line p-4">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Faturamento por dia
                </p>
                {sales.byDay.length === 0 ? (
                  <p className="py-8 text-center text-[12.5px] text-muted-foreground">Sem vendas no período.</p>
                ) : (
                  <RevenueLineChart data={sales.byDay} />
                )}
              </div>
              <div className="rounded-xl border border-line p-4">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Vendas por canal
                </p>
                {sales.byChannel.length === 0 ? (
                  <p className="py-8 text-center text-[12.5px] text-muted-foreground">Sem vendas no período.</p>
                ) : (
                  <SalesChart data={sales.byChannel} />
                )}
              </div>
            </div>

            {sales.byCategory.length > 0 && (
              <div className="mt-4 rounded-xl border border-line p-4">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Vendas por categoria
                </p>
                <div className="flex flex-col gap-2">
                  {sales.byCategory.map((c) => (
                    <div key={c.category} className="flex items-center justify-between text-[12.5px]">
                      <span>{c.category}</span>
                      <span className="tabular-nums font-medium">{formatBRL(c.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === "afiliadas" && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
              <div className="rounded-xl border border-line p-4">
                <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">Receita gerada</p>
                <p className="font-serif text-[22px] font-medium tabular-nums text-ink">{formatBRL(affiliates.totalRevenue)}</p>
              </div>
              <div className="rounded-xl border border-line p-4">
                <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">Comissões</p>
                <p className="font-serif text-[22px] font-medium tabular-nums text-ink">{formatBRL(affiliates.totalCommissions)}</p>
              </div>
            </div>

            {affiliates.rows.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line p-8 text-center text-[12.5px] text-muted-foreground">
                Nenhuma afiliada com movimentação no período.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-line">
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Afiliada</th>
                      <th className="px-3 py-2 text-right font-medium">Conversões</th>
                      <th className="px-3 py-2 text-right font-medium">Receita</th>
                      <th className="px-3 py-2 text-right font-medium">Comissão</th>
                      <th className="px-3 py-2 text-right font-medium">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliates.rows.map((r) => (
                      <tr key={r.id} className="border-b border-line/60 last:border-0">
                        <td className="px-3 py-2.5">
                          <span className="font-medium text-ink">{r.name}</span>
                          {r.channel && <span className="ml-1.5 text-muted-foreground">({r.channel})</span>}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{r.conversions}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{formatBRL(r.revenue)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{formatBRL(r.commissionTotal)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {r.roi !== null ? <span className="font-medium text-success">{r.roi.toFixed(1)}x</span> : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === "financeiro" && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-xl border border-line p-4">
                <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">Receita</p>
                <p className="font-serif text-[20px] font-medium tabular-nums text-ink">{formatBRL(financial.revenue)}</p>
              </div>
              <div className="rounded-xl border border-line p-4">
                <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">Lucro bruto</p>
                <p className="font-serif text-[20px] font-medium tabular-nums text-success">{formatBRL(financial.grossProfit)}</p>
                <p className="text-[10.5px] text-muted-foreground">margem {financial.grossMargin.toFixed(1)}%</p>
              </div>
              <div className="rounded-xl border border-line p-4">
                <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">Lucro líquido</p>
                <p className={`font-serif text-[20px] font-medium tabular-nums ${financial.netProfit >= 0 ? "text-ink" : "text-danger"}`}>
                  {formatBRL(financial.netProfit)}
                </p>
                <p className="text-[10.5px] text-muted-foreground">margem {financial.netMargin.toFixed(1)}%</p>
              </div>
              <div className="rounded-xl border border-line p-4">
                <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">A receber (mês)</p>
                <p className="font-serif text-[20px] font-medium tabular-nums text-ink">{formatBRL(financial.receivables)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-line p-4">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                DRE simplificado
              </p>
              <div className="flex flex-col gap-1.5 text-[12.5px]">
                <div className="flex justify-between"><span className="text-muted-foreground">Receita</span><span className="tabular-nums">{formatBRL(financial.revenue)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Custo dos produtos</span><span className="tabular-nums">-{formatBRL(financial.cogs)}</span></div>
                <div className="flex justify-between border-t border-line pt-1.5 font-medium"><span>Lucro bruto</span><span className="tabular-nums">{formatBRL(financial.grossProfit)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Comissões</span><span className="tabular-nums">-{formatBRL(financial.commissions)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Despesas</span><span className="tabular-nums">-{formatBRL(financial.expenses)}</span></div>
                <div className="flex justify-between border-t border-line pt-1.5 font-medium"><span>Lucro líquido</span><span className="tabular-nums">{formatBRL(financial.netProfit)}</span></div>
              </div>
            </div>

            {financial.marginByProduct.length > 0 && (
              <div className="mt-4 rounded-xl border border-line p-4">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Margem por produto
                </p>
                <div className="flex flex-col gap-2">
                  {financial.marginByProduct.slice(0, 8).map((p) => (
                    <div key={p.nome} className="flex items-center justify-between text-[12.5px]">
                      <span className="truncate">{p.nome}</span>
                      <span className="flex shrink-0 items-center gap-3 tabular-nums">
                        <span className="text-muted-foreground">{formatBRL(p.revenue)}</span>
                        <span className={`w-14 text-right font-medium ${p.margin >= 0 ? "text-success" : "text-danger"}`}>
                          {p.margin.toFixed(0)}%
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
