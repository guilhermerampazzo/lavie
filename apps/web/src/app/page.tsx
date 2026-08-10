import Link from "next/link";
import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { SalesChart } from "@/components/dashboard/sales-chart";
import {
  AlertTriangle,
  OctagonAlert,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type {
  DashboardMetrics,
  StockMetrics,
  AffiliateRankingItem,
  DashboardAlert,
} from "@/types/dashboard";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPct(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function Variation({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-[10.5px] text-muted-foreground">— vs período anterior</span>;
  }
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10.5px] font-medium ${
        up ? "text-success" : "text-danger"
      }`}
    >
      {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {formatPct(value)} vs período anterior
    </span>
  );
}

const PERIODS = [
  { value: "today", label: "Hoje" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
] as const;

export default async function Home({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const session = await auth();
  const period = (searchParams.period ?? "month") as "today" | "week" | "month";

  if (session?.user?.role === "revendedora") {
    return null;
  }

  const [metrics, stock, affiliateRanking, alerts] = await Promise.all([
    apiServerFetch<DashboardMetrics>(`/dashboard/metrics?period=${period}`).catch(
      () =>
        ({
          revenue: 0,
          prevRevenue: 0,
          revenueChange: null,
          avgTicket: 0,
          prevAvgTicket: 0,
          avgTicketChange: null,
          ordersCount: 0,
          prevOrdersCount: 0,
          ordersChange: null,
          conversionRate: 0,
          byChannel: [],
          topProductsByVolume: [],
          topProductsByMargin: [],
          resellerRanking: [],
          commissionsToPay: 0,
          affiliateCommissionRanking: [],
        }) as DashboardMetrics,
    ),
    apiServerFetch<StockMetrics>("/dashboard/stock").catch(
      () =>
        ({
          totalUnits: 0,
          totalProducts: 0,
          byCategory: [],
          stagnant: [],
          critical: [],
          criticalCount: 0,
          turnover: [],
          byLocation: [],
        }) as StockMetrics,
    ),
    apiServerFetch<AffiliateRankingItem[]>("/dashboard/affiliate-ranking").catch(
      () => [] as AffiliateRankingItem[],
    ),
    apiServerFetch<DashboardAlert[]>("/dashboard/alerts").catch(() => [] as DashboardAlert[]),
  ]);

  const stockTotal = stock.byCategory.reduce((s, c) => s + c.total, 0);

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Dashboard</h1>
            <p className="text-[12.5px] text-muted-foreground">Visão geral da operação La Vie</p>
          </div>
          <div className="flex overflow-hidden rounded-lg border border-line">
            {PERIODS.map((p) => (
              <Link
                key={p.value}
                href={`/?period=${p.value}`}
                className={`border-r border-line px-3 py-1.5 text-[11.5px] last:border-r-0 ${
                  period === p.value ? "bg-brand-soft font-medium text-brand-dark" : "text-muted-foreground"
                }`}
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>

        {/* KPIs com variação */}
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-xl border border-line p-4">
            <p className="mb-2 text-[10.5px] uppercase tracking-wide text-muted-foreground">Faturamento</p>
            <p className="font-serif text-[24px] font-medium tabular-nums text-ink">{formatBRL(metrics.revenue)}</p>
            <Variation value={metrics.revenueChange} />
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="mb-2 text-[10.5px] uppercase tracking-wide text-muted-foreground">Ticket médio</p>
            <p className="font-serif text-[24px] font-medium tabular-nums text-ink">{formatBRL(metrics.avgTicket)}</p>
            <Variation value={metrics.avgTicketChange} />
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="mb-2 text-[10.5px] uppercase tracking-wide text-muted-foreground">Pedidos</p>
            <p className="font-serif text-[24px] font-medium tabular-nums text-ink">{metrics.ordersCount}</p>
            <Variation value={metrics.ordersChange} />
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="mb-2 text-[10.5px] uppercase tracking-wide text-muted-foreground">
              Conv. / clientes
            </p>
            <p className="font-serif text-[24px] font-medium tabular-nums text-ink">
              {metrics.conversionRate.toFixed(1)}%
            </p>
            <p className="text-[10.5px] text-muted-foreground">pedidos ÷ clientes do período</p>
          </div>
        </div>

        {/* Estoque resumo */}
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-xl border border-line p-4">
            <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">
              Estoque total
            </p>
            <p className="font-serif text-[20px] font-medium tabular-nums text-ink">
              {stockTotal} <span className="text-[12px] font-normal text-muted-foreground">peças</span>
            </p>
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">
              Estoque crítico
            </p>
            <p
              className={`font-serif text-[20px] font-medium tabular-nums ${
                stock.criticalCount > 0 ? "text-danger" : "text-ink"
              }`}
            >
              {stock.criticalCount}
            </p>
            <p className="text-[10.5px] text-muted-foreground">abaixo do mínimo</p>
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">
              Em consignação
            </p>
            <p className="font-serif text-[20px] font-medium tabular-nums text-ink">
              {stock.byLocation.find((l) => l.location === "consignação")?.units ?? 0}
            </p>
            <p className="text-[10.5px] text-muted-foreground">peças com parceiras</p>
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">
              Comissões a pagar
            </p>
            <p className="font-serif text-[20px] font-medium tabular-nums text-ink">
              {formatBRL(metrics.commissionsToPay)}
            </p>
            <p className="text-[10.5px] text-muted-foreground">afiliadas pendente/aprovado</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-line p-4">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Vendas por canal
              </p>
              {metrics.byChannel.length === 0 ? (
                <p className="py-8 text-center text-[12.5px] text-muted-foreground">Sem vendas no período.</p>
              ) : (
                <SalesChart data={metrics.byChannel} />
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-line p-4">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Mais vendidos (volume)
                </p>
                {metrics.topProductsByVolume.length === 0 ? (
                  <p className="py-6 text-center text-[12px] text-muted-foreground">Sem dados no período.</p>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {metrics.topProductsByVolume.map((p, i) => (
                      <div key={p.nome} className="flex items-center justify-between gap-2 text-[12px]">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="w-4 shrink-0 text-right font-medium text-muted-foreground">{i + 1}º</span>
                          <span className="truncate">{p.nome}</span>
                        </span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">{p.qty} un</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-line p-4">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Maior margem
                </p>
                {metrics.topProductsByMargin.length === 0 ? (
                  <p className="py-6 text-center text-[12px] text-muted-foreground">
                    Cadastre preço de custo para ver margens.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {metrics.topProductsByMargin.map((p, i) => (
                      <div key={p.nome} className="flex items-center justify-between gap-2 text-[12px]">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="w-4 shrink-0 text-right font-medium text-muted-foreground">{i + 1}º</span>
                          <span className="truncate">{p.nome}</span>
                        </span>
                        <span className="shrink-0 tabular-nums font-medium text-success">{p.margin.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {metrics.resellerRanking.length > 0 && (
              <div className="rounded-xl border border-line p-4">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Ranking de revendedoras
                </p>
                <div className="flex flex-col gap-2">
                  {metrics.resellerRanking.map((r) => (
                    <div key={r.name} className="flex items-center justify-between text-[12.5px]">
                      <span>{r.name}</span>
                      <span className="tabular-nums font-medium">{formatBRL(r.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-line p-4">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Alertas em tempo real
              </p>
              {alerts.length === 0 ? (
                <p className="text-[12.5px] text-muted-foreground">Nenhum alerta no momento.</p>
              ) : (
                <div className="flex flex-col">
                  {alerts.map((a) => {
                    const Icon = a.severity === "danger" ? OctagonAlert : AlertTriangle;
                    const content = (
                      <div className="flex items-start gap-2 border-b border-line/60 py-2.5 text-[12px] last:border-0">
                        <Icon
                          className={`mt-0.5 size-3.5 shrink-0 ${a.severity === "danger" ? "text-danger" : "text-warning"}`}
                        />
                        <span>{a.message}</span>
                      </div>
                    );
                    return a.href ? (
                      <Link key={a.id} href={a.href} className="hover:opacity-70">
                        {content}
                      </Link>
                    ) : (
                      <div key={a.id}>{content}</div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-line p-4">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Estoque parado
              </p>
              {stock.stagnant.length === 0 ? (
                <p className="text-[12.5px] text-muted-foreground">Sem dados.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {stock.stagnant.map((s) => (
                    <div key={s.days} className="flex items-center justify-between text-[12px]">
                      <span className="text-muted-foreground">Sem venda há {s.days} dias</span>
                      <span className="tabular-nums font-medium">{s.count} produto(s)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {affiliateRanking.length > 0 && (
              <div className="rounded-xl border border-line p-4">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Influenciadoras — top receita
                </p>
                <div className="flex flex-col gap-2">
                  {affiliateRanking.slice(0, 5).map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-2 text-[12px]">
                      <span className="truncate">
                        {a.name}
                        {a.channel ? <span className="ml-1 text-muted-foreground">({a.channel})</span> : null}
                      </span>
                      <span className="flex shrink-0 items-center gap-2 tabular-nums">
                        <span className="text-muted-foreground">{a.conversions} conv.</span>
                        <span className="font-medium">{formatBRL(a.revenue)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stock.critical.length > 0 && (
              <div className="rounded-xl border border-line p-4">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-danger">
                  Estoque crítico
                </p>
                <div className="flex flex-col gap-2">
                  {stock.critical.slice(0, 5).map((c) => (
                    <Link key={c.id} href={`/produtos/${c.id}`} className="flex items-center justify-between text-[12px] hover:opacity-70">
                      <span className="truncate">{c.nome}</span>
                      <span className="shrink-0 tabular-nums font-medium text-danger">
                        {c.estoque}/{c.minimo}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
