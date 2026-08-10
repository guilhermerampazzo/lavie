import { TrendingDown, TrendingUp, GitCompareArrows } from "lucide-react";
import type { PeriodComparison } from "@/types/reports";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function ChangeBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-[11px] text-muted-foreground">—</span>;
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        up ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
      }`}
    >
      {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {up ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

/** Painel comparativo entre o período atual e o anterior (relatórios). */
export function ComparePanel({ comparison }: { comparison: PeriodComparison }) {
  const { current, previous, changes } = comparison;
  const fmtRange = (from: string, to: string) => {
    const f = new Date(from).toLocaleDateString("pt-BR");
    const t = new Date(to).toLocaleDateString("pt-BR");
    return `${f} → ${t}`;
  };

  return (
    <div className="mb-5 rounded-xl border border-brand/40 bg-brand-soft/30 p-4">
      <p className="mb-3 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-brand-dark">
        <GitCompareArrows className="size-3.5" /> Comparação de períodos
      </p>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-3">
          <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">
            Faturamento
          </p>
          <p className="text-[14px] font-medium tabular-nums text-ink">{formatBRL(current.totalRevenue)}</p>
          <p className="text-[10.5px] text-muted-foreground">
            anterior: {formatBRL(previous.totalRevenue)}
          </p>
          <div className="mt-1.5">
            <ChangeBadge value={changes.revenueChange} />
          </div>
        </div>
        <div className="rounded-lg border border-line bg-surface p-3">
          <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">Pedidos</p>
          <p className="text-[14px] font-medium tabular-nums text-ink">{current.totalOrders}</p>
          <p className="text-[10.5px] text-muted-foreground">anterior: {previous.totalOrders}</p>
          <div className="mt-1.5">
            <ChangeBadge value={changes.ordersChange} />
          </div>
        </div>
        <div className="rounded-lg border border-line bg-surface p-3">
          <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">Ticket médio</p>
          <p className="text-[14px] font-medium tabular-nums text-ink">{formatBRL(current.avgTicket)}</p>
          <p className="text-[10.5px] text-muted-foreground">anterior: {formatBRL(previous.avgTicket)}</p>
          <div className="mt-1.5">
            <ChangeBadge value={changes.avgTicketChange} />
          </div>
        </div>
      </div>

      <p className="mt-3 text-[10.5px] text-muted-foreground">
        <span className="font-medium text-brand-dark">Período atual:</span> {fmtRange(current.from, current.to)} ·{" "}
        <span className="font-medium text-brand-dark">Período anterior:</span> {fmtRange(previous.from, previous.to)}
      </p>
    </div>
  );
}
