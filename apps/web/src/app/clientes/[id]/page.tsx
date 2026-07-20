import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { apiServerFetch, ApiError } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { SegmentBadge } from "@/components/clientes/segment-badge";
import type { Customer } from "@/types/people";

function formatBRL(value: number | string) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const STATUS_LABEL: Record<string, string> = {
  novo: "novo",
  pago: "pago",
  em_separacao: "em separação",
  embalado: "embalado",
  enviado: "enviado",
  entregue: "entregue",
  cancelado: "cancelado",
};

export default async function ClienteDetalhePage({ params }: { params: { id: string } }) {
  const session = await auth();
  const customer = await apiServerFetch<Customer>(`/customers/${params.id}`).catch((err) => {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  });

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[15px] font-semibold text-brand-dark">
            {customer.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
          </span>
          <div>
            <h1 className="mb-1 font-serif text-[19px] font-medium text-ink">{customer.name}</h1>
            <div className="flex flex-wrap items-center gap-1.5">
              {customer.segments.length === 0 ? (
                <span className="text-[12px] text-muted-foreground">Sem segmento</span>
              ) : (
                customer.segments.map((s) => <SegmentBadge key={s} segment={s} />)
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-5">
            <div className="rounded-xl border border-line bg-surface p-5">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Histórico de compras
              </p>
              {!customer.orders || customer.orders.length === 0 ? (
                <p className="text-[12.5px] text-muted-foreground">Nenhum pedido ainda.</p>
              ) : (
                <div className="flex flex-col">
                  {customer.orders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between gap-3 border-b border-line/60 py-2.5 text-[12.5px] last:border-0">
                      <div>
                        <span className="font-medium">Pedido #{o.id.slice(-6)}</span>
                        <span className="ml-2 text-muted-foreground">
                          {new Date(o.createdAt).toLocaleDateString("pt-BR")} · {STATUS_LABEL[o.status] ?? o.status}
                        </span>
                      </div>
                      <span className="tabular-nums font-medium">{formatBRL(o.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {customer.notes && (
              <div className="rounded-xl border border-line bg-surface p-5">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Observações
                </p>
                <p className="text-[12.5px] text-muted-foreground">{customer.notes}</p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-line bg-canvas p-5">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Fidelidade
            </p>
            <div className="flex items-center justify-between border-b border-line py-2 text-[12.5px]">
              <span>Pontos acumulados</span>
              <span className="tabular-nums font-medium">{customer.loyaltyPoints?.points ?? 0} pts</span>
            </div>
            <div className="flex items-center justify-between border-b border-line py-2 text-[12.5px]">
              <span>Pedidos</span>
              <span className="tabular-nums font-medium">{customer.ordersCount}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-[12.5px]">
              <span>Total gasto</span>
              <span className="tabular-nums font-medium">{formatBRL(customer.totalSpent)}</span>
            </div>

            <p className="mb-2 mt-5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Contato
            </p>
            <p className="text-[12.5px] text-ink">{customer.email ?? "-"}</p>
            <p className="text-[12.5px] text-ink">{customer.phone ?? "-"}</p>
            <p className="text-[12.5px] text-muted-foreground">
              {[customer.city, customer.state].filter(Boolean).join("/") || "-"}
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
