import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RevenueLineChart } from "@/components/dashboard/line-chart";
import { ExportButton } from "@/components/relatorios/export-button";
import type { SalesReport } from "@/types/dashboard";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function RelatoriosPage() {
  const session = await auth();
  const report = await apiServerFetch<SalesReport>("/reports/sales").catch(
    () => ({ totalOrders: 0, totalRevenue: 0, byChannel: [], byCategory: [], byDay: [] }) as SalesReport,
  );

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Relatórios</h1>
            <p className="text-[12.5px] text-muted-foreground">
              Vendas do mês · {report.totalOrders} pedidos · {formatBRL(report.totalRevenue)}
            </p>
          </div>
          <ExportButton />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border border-line p-4">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Faturamento por dia
            </p>
            {report.byDay.length === 0 ? (
              <p className="py-8 text-center text-[12.5px] text-muted-foreground">Sem vendas no período.</p>
            ) : (
              <RevenueLineChart data={report.byDay} />
            )}
          </div>

          <div className="rounded-xl border border-line p-4">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Vendas por canal
            </p>
            {report.byChannel.length === 0 ? (
              <p className="py-8 text-center text-[12.5px] text-muted-foreground">Sem vendas no período.</p>
            ) : (
              <SalesChart data={report.byChannel} />
            )}
          </div>
        </div>

        {report.byCategory.length > 0 && (
          <div className="mt-4 rounded-xl border border-line p-4">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Vendas por categoria
            </p>
            <div className="flex flex-col gap-2">
              {report.byCategory.map((c) => (
                <div key={c.category} className="flex items-center justify-between text-[12.5px]">
                  <span>{c.category}</span>
                  <span className="tabular-nums font-medium">{formatBRL(c.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
