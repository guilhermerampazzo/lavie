import { Truck } from "lucide-react";
import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { NewSupplierSheet } from "@/components/fornecedores/new-supplier-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import type { Supplier } from "@/types/product";

export default async function FornecedoresPage() {
  const session = await auth();
  const suppliers = await apiServerFetch<Supplier[]>("/suppliers").catch(() => [] as Supplier[]);

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Fornecedores</h1>
            <p className="text-[12.5px] text-muted-foreground">
              {suppliers.length} fornecedor{suppliers.length === 1 ? "" : "es"} cadastrado
              {suppliers.length === 1 ? "" : "s"} — preenchidos via OCR da nota fiscal ou manualmente.
            </p>
          </div>
          <NewSupplierSheet />
        </div>

        {suppliers.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="Nenhum fornecedor cadastrado"
            description="Cadastre fornecedores ou use o OCR de nota fiscal no cadastro de produto — o fornecedor é criado automaticamente."
          />
        ) : (
          <>
            {/* Desktop: tabela */}
            <div className="hidden overflow-hidden rounded-xl border border-line lg:block">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Fornecedor</th>
                    <th className="px-3 py-2 font-medium">CNPJ/CPF</th>
                    <th className="px-3 py-2 font-medium">Código</th>
                    <th className="px-3 py-2 font-medium">Contato</th>
                    <th className="px-3 py-2 font-medium">Telefone</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.id} className="border-b border-line/60 last:border-0 hover:bg-brand-soft/20">
                      <td className="px-3 py-2.5 font-medium text-ink">{s.name}</td>
                      <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{s.document ?? "—"}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{s.code ?? "—"}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{s.contact ?? "—"}</td>
                      <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{s.phone ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <div className="flex flex-col gap-2.5 lg:hidden">
              {suppliers.map((s) => (
                <div key={s.id} className="rounded-xl border border-line bg-surface p-3">
                  <p className="text-[13px] font-medium text-ink">{s.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {s.document ?? "sem CNPJ"}
                    {s.code ? ` · ${s.code}` : ""}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {s.contact ?? "—"}
                    {s.phone ? ` · ${s.phone}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
