"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { StockMovementType } from "@/types/stock";

const TYPES: Array<{ value: StockMovementType; label: string }> = [
  { value: "entrada", label: "Entrada (fornecedor)" },
  { value: "saida", label: "Saída (venda)" },
  { value: "consignacao_saida", label: "Consignação — saída" },
  { value: "consignacao_retorno", label: "Consignação — retorno" },
  { value: "devolucao", label: "Devolução" },
  { value: "ajuste", label: "Ajuste" },
];

export function StockMovementForm() {
  const router = useRouter();
  const apiFetch = useApiClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{
    type: StockMovementType;
    variantId: string;
    quantity: string;
    reason: string;
  }>({ type: "entrada", variantId: "", quantity: "", reason: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.variantId.trim() || !form.quantity) {
      toast.error("Informe o ID/SKU da variante e a quantidade.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/stock/movements", {
        method: "POST",
        body: JSON.stringify({
          type: form.type,
          variantId: form.variantId.trim(),
          quantity: Math.abs(Number(form.quantity)),
          reason: form.reason.trim() || undefined,
        }),
      });
      toast.success("Movimentação registrada — estoque atualizado.");
      setOpen(false);
      setForm({ type: "entrada", variantId: "", quantity: "", reason: "" });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível registrar a movimentação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="rounded-btn bg-brand text-white hover:bg-brand-dark">
          <PackagePlus className="mr-1.5 size-3.5" /> Nova movimentação
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif text-lg text-ink">Registrar movimentação</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <div>
            <Label className="mb-1.5 block text-xs font-medium">Tipo</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.value })}
                  className={`rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                    form.type === t.value
                      ? "border-brand bg-brand text-white"
                      : "border-line text-muted-foreground hover:border-brand/40"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium">ID da variante</Label>
            <Input
              className="h-9 rounded-[9px] border-line text-[12.5px]"
              placeholder="Cole o ID da variante (veja no produto)"
              value={form.variantId}
              onChange={(e) => setForm({ ...form, variantId: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium">Quantidade</Label>
            <Input
              className="h-9 rounded-[9px] border-line text-[12.5px]"
              type="number"
              min={1}
              placeholder="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium">Motivo</Label>
            <Input
              className="h-9 rounded-[9px] border-line text-[12.5px]"
              placeholder="NF 1234 · ajuste de contagem · venda #5"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>
          <Button type="submit" className="mt-2 rounded-btn bg-brand text-white hover:bg-brand-dark" disabled={loading}>
            {loading && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            Registrar
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
