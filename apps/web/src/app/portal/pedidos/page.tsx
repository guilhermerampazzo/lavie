import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { PortalShell } from "@/components/portal/portal-shell";
import { OrderStatusBadge } from "@/components/pedidos/order-status-badge";
import { ReturnRequestButton } from "@/components/portal/return-request-button";
import { EmptyState } from "@/components/ui/empty-state";
import { ShoppingBag } from "lucide-react";
import type { PortalOrder } from "@/types/portal";

function formatBRL(value: string | number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const PAYMENT_LABEL: Record<string, string> = {
  boleto: "Boleto",
  pix: "Pix",
  transferencia: "Transferência",
  credito_em_conta: "Crédito em conta",
};

export default async function PortalPedidosPage() {
  const session = await auth();
  const orders = await apiServerFetch<PortalOrder[]>("/portal/orders").catch(() => [] as PortalOrder[]);

  return (
    <PortalShell resellerName={session?.user?.name ?? ""}>
      <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Meus pedidos</h1>
      <p className="mb-5 text-[12.5px] text-muted-foreground">{orders.length} pedidos realizados</p>

      {orders.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="Nenhum pedido ainda" description="Seus pedidos feitos no catálogo aparecem aqui." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {orders.map((ro) => (
            <div key={ro.id} className="rounded-xl border border-line bg-surface p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium">Pedido #{ro.order?.id.slice(-6)}</span>
                  {ro.order && <OrderStatusBadge status={ro.order.status} />}
                </div>
                {ro.paymentMethod && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium ${
                      ro.paymentStatus === "pago"
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {PAYMENT_LABEL[ro.paymentMethod] ?? ro.paymentMethod} ·{" "}
                    {ro.paymentStatus === "pago" ? "pago" : "aguardando"}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {ro.order?.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-[12px] text-muted-foreground">
                    <span>{item.sku} × {item.quantity}</span>
                    <span className="tabular-nums">{formatBRL(Number(item.unitPrice) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                <span className="text-[12.5px] font-medium">
                  Total <span className="tabular-nums">{formatBRL(ro.order?.total ?? 0)}</span>
                </span>
                {ro.order && <ReturnRequestButton orderId={ro.order.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalShell>
  );
}
