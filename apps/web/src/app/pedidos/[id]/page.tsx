import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { apiServerFetch, ApiError } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { OrderStatusBadge } from "@/components/pedidos/order-status-badge";
import { StatusUpdater } from "@/components/pedidos/status-updater";

interface OrderDetail {
  id: string;
  status: string;
  channel: string;
  total: string;
  trackingCode?: string | null;
  createdAt: string;
  customer?: { name: string; email?: string | null } | null;
  items: Array<{ id: string; name: string; sku: string; quantity: number; unitPrice: string }>;
}

function formatBRL(value: string | number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PedidoDetalhePage({ params }: { params: { id: string } }) {
  const session = await auth();
  const order = await apiServerFetch<OrderDetail>(`/orders/${params.id}`).catch((err) => {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  });

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="mb-1 font-serif text-[20px] font-medium text-ink">Pedido #{order.id.slice(-6)}</h1>
            <div className="flex items-center gap-2">
              <OrderStatusBadge status={order.status} />
              <span className="text-[12px] text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>
          <StatusUpdater orderId={order.id} status={order.status} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-xl border border-line bg-surface p-5">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Itens</p>
            <div className="flex flex-col">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-line/60 py-2.5 text-[12.5px] last:border-0">
                  <span>
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2 text-muted-foreground">{item.sku} × {item.quantity}</span>
                  </span>
                  <span className="tabular-nums font-medium">{formatBRL(Number(item.unitPrice) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between border-t border-line pt-3 text-[13px] font-medium">
              <span>Total</span>
              <span className="tabular-nums">{formatBRL(order.total)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-canvas p-5">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Cliente</p>
            <p className="text-[12.5px] text-ink">{order.customer?.name ?? "Não identificado"}</p>
            <p className="text-[12.5px] text-muted-foreground">{order.customer?.email ?? "-"}</p>

            {order.trackingCode && (
              <>
                <p className="mb-2 mt-5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Rastreio
                </p>
                <p className="text-[12.5px]">{order.trackingCode}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
