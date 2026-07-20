import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderStatusBadge } from "@/components/pedidos/order-status-badge";
import { cn } from "@/lib/utils";
import type { OrderListItem } from "@/types/dashboard";

const CHANNEL_LABEL: Record<string, string> = {
  site: "Site",
  revendedora: "Revendedora",
  marketplace: "Marketplace",
  fisico: "Físico",
};

const STATUS_FILTERS = [
  { value: "", label: "Todos" },
  { value: "novo", label: "Novo" },
  { value: "pago", label: "Pago" },
  { value: "em_separacao", label: "Em separação" },
  { value: "embalado", label: "Embalado" },
  { value: "enviado", label: "Enviado" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
] as const;

function formatBRL(value: string | number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: { status?: string; canal?: string };
}) {
  const session = await auth();
  const status = searchParams.status ?? "";
  const canal = searchParams.canal ?? "";
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (canal) query.set("channel", canal);
  const qs = query.toString();

  const orders = await apiServerFetch<OrderListItem[]>(`/orders${qs ? `?${qs}` : ""}`).catch(
    () => [] as OrderListItem[],
  );

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-4">
          <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Pedidos</h1>
          <p className="text-[12.5px] text-muted-foreground">{orders.length} pedidos</p>
        </div>

        <div className="mb-5 flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={`/pedidos${f.value ? `?status=${f.value}` : ""}`}
              className={cn(
                "flex h-[27px] items-center rounded-full border border-line px-2.5 text-[11.5px] text-muted-foreground",
                status === f.value && "border-transparent bg-brand-soft font-medium text-brand-dark",
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Nenhum pedido encontrado"
            description="Ajuste os filtros ou aguarde novos pedidos chegarem."
          />
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
