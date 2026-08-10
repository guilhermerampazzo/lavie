"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Package, Tag } from "lucide-react";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";
import type { PortalCatalog, PaymentMethod } from "@/types/portal";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const PAYMENT_OPTIONS: Array<{ value: PaymentMethod; label: string; hint: string }> = [
  { value: "pix", label: "Pix", hint: "Aprovação imediata" },
  { value: "boleto", label: "Boleto", hint: "Vencimento configurável" },
  { value: "transferencia", label: "Transferência", hint: "PIX/TED bancário" },
  { value: "credito_em_conta", label: "Crédito em conta", hint: "Usa seu saldo de revendedora" },
];

export function PortalCatalog({ data }: { data: PortalCatalog }) {
  const apiFetch = useApiClient();
  const router = useRouter();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [submitting, setSubmitting] = useState(false);

  const { items, minQuantity, kits } = data;

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

  function addKit(kit: PortalCatalog["kits"][number]) {
    setCart((prev) => {
      const next = { ...prev };
      for (const item of kit.items) {
        next[item.productId] = (next[item.productId] ?? 0) + item.quantity;
      }
      return next;
    });
    toast.success(`Kit "${kit.name}" adicionado ao carrinho.`);
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
        body: JSON.stringify({ items: orderItems, paymentMethod }),
      });
      toast.success(
        paymentMethod === "credito_em_conta"
          ? "Pedido enviado — valor debitado do seu crédito."
          : "Pedido enviado — aguardando pagamento.",
      );
      setCart({});
      router.push("/portal/pedidos");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível enviar o pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Catálogo</h1>
          <p className="text-[12.5px] text-muted-foreground">
            Preços exclusivos de revenda · mínimo {minQuantity} un por item
          </p>
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

      {kits.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-brand-dark">
            <Tag className="size-3.5" /> Kits exclusivos para revendedoras
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {kits.map((kit) => (
              <div key={kit.id} className="rounded-xl border border-brand/40 bg-brand-soft/40 p-4">
                <p className="mb-1 text-[13px] font-semibold text-ink">{kit.name}</p>
                {kit.description && <p className="mb-2 text-[11.5px] text-muted-foreground">{kit.description}</p>}
                <div className="mb-2 flex flex-col gap-0.5 text-[11.5px] text-muted-foreground">
                  {kit.items.map((i) => (
                    <span key={i.productId}>
                      {i.quantity}× {i.nome}
                    </span>
                  ))}
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[14px] font-semibold tabular-nums text-brand-dark">{formatBRL(kit.price)}</span>
                  {kit.discountPct > 0 && (
                    <>
                      <span className="text-[11px] text-muted-foreground line-through">{formatBRL(kit.total)}</span>
                      <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">
                        -{kit.discountPct}%
                      </span>
                    </>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-7 w-full rounded-md border-brand/50 text-[11px] text-brand-dark"
                  onClick={() => addKit(kit)}
                >
                  Adicionar kit
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {cartCount > 0 && (
        <div className="mt-5 rounded-xl border border-line bg-surface p-4">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Pagamento
          </p>
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPaymentMethod(opt.value)}
                className={`rounded-lg border p-2.5 text-left transition-colors ${
                  paymentMethod === opt.value
                    ? "border-brand bg-brand-soft/50"
                    : "border-line bg-surface hover:border-brand/40"
                }`}
              >
                <span className="block text-[12px] font-medium text-ink">{opt.label}</span>
                <span className="block text-[10.5px] text-muted-foreground">{opt.hint}</span>
              </button>
            ))}
          </div>
          <Button
            type="button"
            disabled={submitting}
            onClick={checkout}
            className="w-full rounded-btn bg-brand text-white hover:bg-brand-dark"
          >
            {submitting
              ? "Enviando…"
              : `Finalizar pedido · ${formatBRL(cartTotal)} (${paymentMethod.replace(/_/g, " ")})`}
          </Button>
        </div>
      )}
    </div>
  );
}
