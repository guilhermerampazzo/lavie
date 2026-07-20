import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/produtos/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Product } from "@/types/product";

function formatBRL(value: string | number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ProdutosPage() {
  const session = await auth();
  const products = await apiServerFetch<Product[]>("/products").catch(() => [] as Product[]);

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Produtos</h1>
            <p className="text-[12.5px] text-muted-foreground">
              {products.length} produto{products.length === 1 ? "" : "s"} cadastrado
              {products.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="rounded-btn border-line">
              <Link href="/produtos/templates">Templates</Link>
            </Button>
            <Button asChild className="rounded-btn bg-brand text-white hover:bg-brand-dark">
            <Link href="/produtos/novo">
              <Plus className="mr-1.5 size-3.5" />
              Novo produto
            </Link>
            </Button>
          </div>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum produto cadastrado"
            description="Cadastre a primeira peça para começar a publicar na Nuvemshop."
            action={
              <Button asChild className="mt-2 rounded-btn bg-brand text-white hover:bg-brand-dark">
                <Link href="/produtos/novo">Cadastrar produto</Link>
              </Button>
            }
          />
        ) : (
          <>
            {/* Desktop: tabela */}
            <div className="hidden overflow-hidden rounded-xl border border-line lg:block">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Produto</th>
                    <th className="px-3 py-2 font-medium">Categoria</th>
                    <th className="px-3 py-2 text-right font-medium">Preço</th>
                    <th className="px-3 py-2 text-right font-medium">Estoque</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-line/60 last:border-0 hover:bg-brand-soft/20">
                      <td className="px-3 py-2.5">
                        <Link href={`/produtos/${p.id}`} className="flex items-center gap-2.5">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand-dark">
                            <Package className="size-3.5" strokeWidth={1.7} />
                          </span>
                          <span>
                            <span className="block font-medium text-ink">{p.nomeGerado}</span>
                            <span className="block text-[11px] text-muted-foreground">
                              SKU {p.variants[0]?.sku ?? "-"}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{p.category?.name ?? "-"}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatBRL(p.precoBase)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {p.variants.reduce((sum, v) => sum + v.estoque, 0)}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <div className="flex flex-col gap-2.5 lg:hidden">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/produtos/${p.id}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-dark">
                    <Package className="size-[18px]" strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink">{p.nomeGerado}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {p.variants[0]?.sku ?? "-"} · {p.variants.reduce((s, v) => s + v.estoque, 0)} un
                    </span>
                    <span className="mt-1 block text-[12.5px] font-medium tabular-nums">
                      {formatBRL(p.precoBase)}
                    </span>
                  </span>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
