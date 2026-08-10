import { Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { StockMovementForm } from "@/components/estoque/stock-movement-form";
import type { StockMovementItem } from "@/types/stock";

const TYPE_LABEL: Record<string, string> = {
  entrada: "Entrada",
  saida: "Saída",
  consignacao_saida: "Consignação (saída)",
  consignacao_retorno: "Consignação (retorno)",
  devolucao: "Devolução",
  ajuste: "Ajuste",
};

export default async function EstoquePage() {
  const session = await auth();
  const movements = await apiServerFetch<StockMovementItem[]>("/stock/movements").catch(
    () => [] as StockMovementItem[],
  );

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Estoque</h1>
            <p className="text-[12.5px] text-muted-foreground">
              Movimentações (entradas, saídas, consignação, devoluções, ajustes)
            </p>
          </div>
          <StockMovementForm />
        </div>

        {movements.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhuma movimentação registrada"
            description="Registre entradas de fornecedor, saídas de venda e ajustes — cada movimento atualiza o saldo da variante."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium">SKU</th>
                  <th className="px-3 py-2 text-right font-medium">Qtd</th>
                  <th className="px-3 py-2 font-medium">Motivo</th>
                  <th className="px-3 py-2 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-b border-line/60 last:border-0">
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium ${
                          m.quantity >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                        }`}
                      >
                        {TYPE_LABEL[m.type] ?? m.type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{m.variantId}</td>
                    <td
                      className={`px-3 py-2.5 text-right font-medium tabular-nums ${
                        m.quantity >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {m.quantity >= 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{m.reason ?? "—"}</td>
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                      {new Date(m.createdAt).toLocaleDateString("pt-BR")} {new Date(m.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
