import Link from "next/link";
import { notFound } from "next/navigation";
import { Barcode, Edit3 } from "lucide-react";
import { auth } from "@/lib/auth";
import { apiServerFetch, ApiError } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { StatusBadge } from "@/components/produtos/status-badge";
import { PublishButton } from "@/components/produtos/publish-button";
import { ApproveButton } from "@/components/produtos/approve-button";
import { PublishChannelsButton } from "@/components/produtos/publish-channels-button";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";

function formatBRL(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ProdutoDetalhePage({ params }: { params: { id: string } }) {
  const session = await auth();
  const product = await apiServerFetch<Product>(`/products/${params.id}`).catch((err) => {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  });

  const canPublish = product.status !== "active" && product.variants.length > 0;

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="mb-1 font-serif text-[20px] font-medium leading-snug text-ink">
              {product.nomeGerado}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground">
              <StatusBadge status={product.status} />
              {product.skuInterno && <span className="tabular-nums">SKU {product.skuInterno}</span>}
              {product.nuvemshopProductId && <span>Nuvemshop #{product.nuvemshopProductId}</span>}
              {product.supplier && <span>· {product.supplier.name}</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-btn border-line">
              <Link href={`/produtos/${product.id}/etiqueta`}>
                <Barcode className="mr-1.5 size-3.5" /> Etiqueta
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-btn border-line">
              <Link href={`/produtos/${product.id}/editar`}>
                <Edit3 className="mr-1.5 size-3.5" /> Editar
              </Link>
            </Button>
            {product.status === "em_revisao" && <ApproveButton productId={product.id} />}
            {canPublish && <PublishButton productId={product.id} />}
            {product.status === "active" && <PublishChannelsButton productId={product.id} />}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-xl border border-line bg-surface p-5">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Descrição
            </p>
            <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-ink">
              {product.descricaoGerada || "—"}
            </p>

            {product.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {product.tags.map((t) => (
                  <span key={t} className="rounded-full bg-brand-soft px-2 py-0.5 text-[10.5px] text-brand-dark">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-xl border border-line bg-surface p-5">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Ficha técnica
              </p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12.5px]">
                <div>
                  <dt className="text-muted-foreground">Tipo</dt>
                  <dd className="font-medium capitalize">{product.tipoPeca ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Material</dt>
                  <dd className="font-medium">{product.material ?? product.banhoMaterial ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Cor / acabamento</dt>
                  <dd className="font-medium">{product.corAcabamento ?? product.cor ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Estilo</dt>
                  <dd className="font-medium capitalize">{product.estilo ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Tamanho</dt>
                  <dd className="font-medium">{product.tamanho ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Fecho</dt>
                  <dd className="font-medium">{product.fecho ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Peso / dimensões</dt>
                  <dd className="font-medium">
                    {product.pesoGramas ? `${product.pesoGramas} g` : "—"}
                    {product.dimensoes ? ` · ${product.dimensoes}` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Coleção</dt>
                  <dd className="font-medium">{product.colecao ?? "—"}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-line bg-surface p-5">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Preços e estoque
              </p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12.5px]">
                <div>
                  <dt className="text-muted-foreground">Custo</dt>
                  <dd className="font-medium tabular-nums">{formatBRL(product.precoCusto)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Venda</dt>
                  <dd className="font-medium tabular-nums">{formatBRL(product.precoBase)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Revendedora</dt>
                  <dd className="font-medium tabular-nums">{formatBRL(product.precoRevendedora)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Promocional</dt>
                  <dd className="font-medium tabular-nums">{formatBRL(product.precoPromocional)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Estoque mínimo</dt>
                  <dd className="font-medium tabular-nums">{product.estoqueMinimo}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Margem</dt>
                  <dd className="font-medium tabular-nums">
                    {product.precoCusto && Number(product.precoCusto) > 0
                      ? `${(((Number(product.precoBase) - Number(product.precoCusto)) / Number(product.precoCusto)) * 100).toFixed(0)}%`
                      : "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-line bg-surface p-5">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Canais
              </p>
              <div className="flex flex-wrap gap-1.5">
                {product.canais.length === 0 && <span className="text-[12px] text-muted-foreground">Nenhum canal selecionado</span>}
                {product.canais.map((c) => (
                  <span key={c.id} className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand-dark">
                    {c.channel.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
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
                  <span className="text-muted-foreground">
                    {[v.cor, v.tamanho, v.banho].filter(Boolean).join(" · ") || "—"}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{v.estoque} un</span>
                  <span className="tabular-nums font-medium">{formatBRL(v.preco)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Conservação
            </p>
            <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-ink">
              {product.instrucoesConservacao || "—"}
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
