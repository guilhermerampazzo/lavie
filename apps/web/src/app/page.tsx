import Link from "next/link";
import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { AlertTriangle, OctagonAlert } from "lucide-react";
import type { DashboardMetrics, DashboardAlert } from "@/types/dashboard";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
    // Papel revendedora nao ve o dashboard interno; middleware ja redireciona,
    // este guard e so uma segunda camada de seguranca.
    return null;
  }

  const [metrics, alerts] = await Promise.all([
    apiServerFetch<DashboardMetrics>(`/dashboard/metrics?period=${period}`).catch(
      () => ({ revenue: 0, avgTicket: 0, ordersCount: 0, byChannel: [], resellerRanking: [] }) as DashboardMetrics,
    ),
    apiServerFetch<DashboardAlert[]>("/dashboard/alerts").catch(() => [] as DashboardAlert[]),
  ]);

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

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
          <div className="rounded-xl border border-line p-4">
            <p className="mb-2 text-[10.5px] uppercase tracking-wide text-muted-foreground">Faturamento</p>
            <p className="font-serif text-[26px] font-medium tabular-nums text-ink">{formatBRL(metrics.revenue)}</p>
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="mb-2 text-[10.5px] uppercase tracking-wide text-muted-foreground">Ticket médio</p>
            <p className="font-serif text-[26px] font-medium tabular-nums text-ink">{formatBRL(metrics.avgTicket)}</p>
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="mb-2 text-[10.5px] uppercase tracking-wide text-muted-foreground">Pedidos</p>
            <p className="font-serif text-[26px] font-medium tabular-nums text-ink">{metrics.ordersCount}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border border-line p-4">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Vendas por canal
            </p>
            {metrics.byChannel.length === 0 ? (
              <p className="py-8 text-center text-[12.5px] text-muted-foreground">Sem vendas no período.</p>
            ) : (
              <SalesChart data={metrics.byChannel} />
            )}

            {metrics.resellerRanking.length > 0 && (
              <>
                <p className="mb-3 mt-5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
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
              </>
            )}
          </div>

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
        </div>
      </div>
    </AppShell>
  );
}
