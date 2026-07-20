"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Package } from "lucide-react";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";
import type { PortalCatalogItem } from "@/types/portal";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PortalCatalog({ items }: { items: PortalCatalogItem[] }) {
  const apiFetch = useApiClient();
  const router = useRouter();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const cartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);
  const cartTotal = useMemo(() => {
    return Object.entries(cart).reduce((sum, [productId, qty]) => {
      const item = items.find((i) => i.id === productId);
      return sum + (item?.precoRevenda ?? 0) * qty;
    }, 0);
  }, [cart, items]);

  function addToCart(productId: string) {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }));
  }

  async function checkout() {
    setSubmitting(true);
    try {
      const orderItems = Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([productId, quantity]) => {
          const item = items.find((i) => i.id === productId)!;
          const variant = item.variants[0];
          return { productId, variantId: variant.id, quantity };
        });

      await apiFetch("/portal/orders", {
        method: "POST",
        body: JSON.stringify({ items: orderItems }),
      });
      toast.success("Pedido enviado com sucesso.");
      setCart({});
      router.push("/portal/pedidos");
      router.refresh();
    } catch {
      toast.error("Não foi possível enviar o pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Catálogo</h1>
          <p className="text-[12.5px] text-muted-foreground">Preços exclusivos de revenda</p>
        </div>
        <Button
          type="button"
          disabled={cartCount === 0 || submitting}
          onClick={checkout}
          className="rounded-btn bg-brand text-white hover:bg-brand-dark"
        >
          {submitting ? "Enviando…" : `Carrinho (${cartCount}) · ${formatBRL(cartTotal)}`}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="flex h-24 items-center justify-center bg-brand-soft text-brand-dark">
              <Package className="size-6" strokeWidth={1.5} />
            </div>
            <div className="p-3">
              <p className="mb-1.5 truncate text-[12px] font-medium text-ink">{item.nome}</p>
              <p className="text-[10.5px] text-muted-foreground line-through">{formatBRL(item.precoVarejo)}</p>
              <p className="mb-2 text-[14px] font-semibold text-brand-dark">{formatBRL(item.precoRevenda)}</p>
              <Button
                type="button"
                variant="outline"
                className="h-7 w-full rounded-md border-line text-[11px]"
                onClick={() => addToCart(item.id)}
              >
                {cart[item.id] ? `Adicionado (${cart[item.id]})` : "Adicionar"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
