import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderStatusBadge } from "@/components/pedidos/order-status-badge";
import type { OrderListItem } from "@/types/dashboard";

const CHANNEL_LABEL: Record<string, string> = {
  site: "Site",
  revendedora: "Revendedora",
  marketplace: "Marketplace",
  fisico: "Físico",
};

function formatBRL(value: string | number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PedidosPage() {
  const session = await auth();
  const orders = await apiServerFetch<OrderListItem[]>("/orders").catch(() => [] as OrderListItem[]);

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5">
          <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Pedidos</h1>
          <p className="text-[12.5px] text-muted-foreground">{orders.length} pedidos</p>
        </div>

        {orders.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="Nenhum pedido ainda" description="Pedidos de todos os canais aparecem aqui." />
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-xl border border-line lg:block">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Pedido</th>
                    <th className="px-3 py-2 font-medium">Cliente</th>
                    <th className="px-3 py-2 font-medium">Canal</th>
                    <th className="px-3 py-2 text-right font-medium">Valor</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-line/60 last:border-0 hover:bg-brand-soft/20">
                      <td className="px-3 py-2.5">
                        <Link href={`/pedidos/${o.id}`} className="font-medium text-ink">
                          #{o.id.slice(-6)}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5">{o.customer?.name ?? "-"}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{CHANNEL_LABEL[o.channel] ?? o.channel}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatBRL(o.total)}</td>
                      <td className="px-3 py-2.5">
                        <OrderStatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2.5 lg:hidden">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/pedidos/${o.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3"
                >
                  <span>
                    <span className="block text-[13px] font-medium text-ink">#{o.id.slice(-6)}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {o.customer?.name ?? "-"} · {formatBRL(o.total)}
                    </span>
                  </span>
                  <OrderStatusBadge status={o.status} />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
