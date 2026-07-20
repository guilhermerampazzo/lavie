import Link from "next/link";
import { Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentBadge } from "@/components/clientes/segment-badge";
import type { Customer } from "@/types/people";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ClientesPage() {
  const session = await auth();
  const customers = await apiServerFetch<Customer[]>("/customers").catch(() => [] as Customer[]);
  const vipCount = customers.filter((c) => c.segments.includes("vip")).length;

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5">
          <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Clientes</h1>
          <p className="text-[12.5px] text-muted-foreground">
            {customers.length} cliente{customers.length === 1 ? "" : "s"} · {vipCount} VIP
          </p>
        </div>

        {customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum cliente cadastrado"
            description="Clientes aparecem aqui conforme pedidos forem sincronizados da Nuvemshop."
          />
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-xl border border-line lg:block">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Cliente</th>
                    <th className="px-3 py-2 font-medium">Segmentos</th>
                    <th className="px-3 py-2 text-right font-medium">Pedidos</th>
                    <th className="px-3 py-2 text-right font-medium">Total gasto</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-line/60 last:border-0 hover:bg-brand-soft/20">
                      <td className="px-3 py-2.5">
                        <Link href={`/clientes/${c.id}`} className="flex items-center gap-2.5">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand-dark">
                            {c.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                          </span>
                          <span>
                            <span className="block font-medium text-ink">{c.name}</span>
                            <span className="block text-[11px] text-muted-foreground">{c.email ?? "-"}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {c.segments.length === 0 ? (
                            <span className="text-muted-foreground">-</span>
                          ) : (
                            c.segments.map((s) => <SegmentBadge key={s} segment={s} />)
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{c.ordersCount}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatBRL(c.totalSpent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2.5 lg:hidden">
              {customers.map((c) => (
                <Link
                  key={c.id}
                  href={`/clientes/${c.id}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[12px] font-semibold text-brand-dark">
                    {c.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink">{c.name}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {c.ordersCount} pedidos · {formatBRL(c.totalSpent)}
                    </span>
                  </span>
                  {c.segments[0] && <SegmentBadge segment={c.segments[0]} />}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
