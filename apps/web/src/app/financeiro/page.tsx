import Link from "next/link";
import { Wallet } from "lucide-react";
import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { AccountStatusBadge } from "@/components/finance/account-status-badge";
import { NewAccountSheet } from "@/components/finance/new-account-sheet";
import { MarkPaidButton } from "@/components/finance/mark-paid-button";
import type { AccountItem, CashFlowMonth } from "@/types/finance";

function formatBRL(value: number | string) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function FinanceiroPage() {
  const session = await auth();
  const [accounts, cashFlow] = await Promise.all([
    apiServerFetch<AccountItem[]>("/finance/accounts").catch(() => [] as AccountItem[]),
    apiServerFetch<CashFlowMonth[]>("/finance/cash-flow").catch(() => [] as CashFlowMonth[]),
  ]);

  const receivables = accounts.filter((a) => a.type === "receivable");
  const payables = accounts.filter((a) => a.type === "payable");
  const receivablesOpen = receivables
    .filter((a) => a.status !== "paga")
    .reduce((s, a) => s + Number(a.amount), 0);
  const payablesOpen = payables
    .filter((a) => a.status !== "paga")
    .reduce((s, a) => s + Number(a.amount), 0);

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Financeiro</h1>
            <p className="text-[12.5px] text-muted-foreground">
              Contas a receber e a pagar · fluxo de caixa
            </p>
          </div>
          <NewAccountSheet />
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
          <div className="rounded-xl border border-line p-4">
            <p className="mb-2 text-[10.5px] uppercase tracking-wide text-muted-foreground">A receber (aberto)</p>
            <p className="font-serif text-[22px] font-medium tabular-nums text-success">{formatBRL(receivablesOpen)}</p>
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="mb-2 text-[10.5px] uppercase tracking-wide text-muted-foreground">A pagar (aberto)</p>
            <p className="font-serif text-[22px] font-medium tabular-nums text-danger">{formatBRL(payablesOpen)}</p>
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="mb-2 text-[10.5px] uppercase tracking-wide text-muted-foreground">Saldo previsto</p>
            <p className="font-serif text-[22px] font-medium tabular-nums text-ink">
              {formatBRL(receivablesOpen - payablesOpen)}
            </p>
          </div>
        </div>

        {cashFlow.length > 0 && (
          <div className="mb-5 rounded-xl border border-line p-4">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Fluxo de caixa (6 meses)
            </p>
            <div className="flex flex-col gap-1.5">
              {cashFlow.map((m) => (
                <div key={m.month} className="flex items-center justify-between text-[12px]">
                  <span className="w-20 capitalize text-muted-foreground">{m.month}</span>
                  <span className="flex-1 text-right tabular-nums text-success">+{formatBRL(m.receivables)}</span>
                  <span className="flex-1 text-right tabular-nums text-danger">-{formatBRL(m.payables)}</span>
                  <span className={`w-28 text-right font-medium tabular-nums ${m.balance >= 0 ? "text-ink" : "text-danger"}`}>
                    {formatBRL(m.balance)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {accounts.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Nenhuma conta lançada"
            description="Registre contas a receber (vendas, parcelas) e a pagar (fornecedores, comissões) para acompanhar o financeiro."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium">Descrição</th>
                  <th className="px-3 py-2 font-medium">Vencimento</th>
                  <th className="px-3 py-2 text-right font-medium">Valor</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} className="border-b border-line/60 last:border-0">
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium ${
                          a.type === "receivable" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                        }`}
                      >
                        {a.type === "receivable" ? "Receber" : "Pagar"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-medium text-ink">{a.description}</td>
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                      {new Date(a.dueDate).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{formatBRL(a.amount)}</td>
                    <td className="px-3 py-2.5">
                      <AccountStatusBadge status={a.status} />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {a.status !== "paga" && <MarkPaidButton accountId={a.id} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-[11px] text-muted-foreground">
          <Link href="/relatorios" className="underline hover:text-brand-dark">
            Ver relatórios
          </Link>{" "}
          · Integração financeira com o Bling (contas a receber) disponível quando o ERP estiver conectado.
        </p>
      </div>
    </AppShell>
  );
}
