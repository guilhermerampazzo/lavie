import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { apiServerFetch, ApiError } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { StatusBadge } from "@/components/produtos/status-badge";
import type { Product } from "@/types/product";

function formatBRL(value: string | number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ProdutoDetalhePage({ params }: { params: { id: string } }) {
  const session = await auth();
  const product = await apiServerFetch<Product>(`/products/${params.id}`).catch((err) => {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  });

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-1 font-serif text-[20px] font-medium leading-snug text-ink">
              {product.nomeGerado}
            </h1>
            <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
              <StatusBadge status={product.status} />
              {product.nuvemshopProductId && <span>Nuvemshop #{product.nuvemshopProductId}</span>}
            </div>
          </div>
          <span className="whitespace-nowrap text-[16px] font-medium tabular-nums text-ink">
            {formatBRL(product.precoBase)}
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-xl border border-line bg-surface p-5">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Descrição
            </p>
            <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-ink">
              {product.descricaoGerada}
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Variantes
            </p>
            <div className="flex flex-col gap-2">
              {product.variants.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-[12.5px]"
                >
                  <span className="font-medium">{v.sku}</span>
                  <span className="tabular-nums text-muted-foreground">{v.estoque} un</span>
                  <span className="tabular-nums font-medium">{formatBRL(v.preco)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
