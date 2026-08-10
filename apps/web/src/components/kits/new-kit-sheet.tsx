"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
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

interface KitItemRow {
  productId: string;
  quantity: string;
}

export function NewKitSheet() {
  const router = useRouter();
  const apiFetch = useApiClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", discountPct: "0" });
  const [rows, setRows] = useState<KitItemRow[]>([{ productId: "", quantity: "1" }]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const items = rows
      .filter((r) => r.productId.trim())
      .map((r) => ({ productId: r.productId.trim(), quantity: Math.max(1, Number(r.quantity) || 1) }));
    if (!form.name.trim() || items.length === 0) {
      toast.error("Informe o nome do kit e pelo menos um produto.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/kits", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          discountPct: Number(form.discountPct) || 0,
          items,
        }),
      });
      toast.success("Kit criado — já aparece no catálogo do portal.");
      setOpen(false);
      setForm({ name: "", description: "", discountPct: "0" });
      setRows([{ productId: "", quantity: "1" }]);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível criar o kit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="rounded-btn bg-brand text-white hover:bg-brand-dark">
          <Plus className="mr-1.5 size-3.5" /> Novo kit
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif text-lg text-ink">Novo kit exclusivo</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <div>
            <Label className="mb-1.5 block text-xs font-medium">Nome do kit</Label>
            <Input
              className="h-9 rounded-[9px] border-line text-[12.5px]"
              placeholder="Kit Noiva Majesté"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium">Descrição (opcional)</Label>
            <Input
              className="h-9 rounded-[9px] border-line text-[12.5px]"
              placeholder="Colar + brincos para noivas"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium">Desconto adicional (%)</Label>
            <Input
              className="h-9 rounded-[9px] border-line text-[12.5px]"
              type="number"
              min={0}
              max={100}
              value={form.discountPct}
              onChange={(e) => setForm({ ...form, discountPct: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium">Produtos do kit</Label>
            <div className="flex flex-col gap-2">
              {rows.map((row, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    className="h-9 flex-1 rounded-[9px] border-line text-[12.5px]"
                    placeholder="ID do produto"
                    value={row.productId}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, productId: e.target.value };
                      setRows(next);
                    }}
                  />
                  <Input
                    className="h-9 w-16 rounded-[9px] border-line text-[12.5px]"
                    type="number"
                    min={1}
                    value={row.quantity}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, quantity: e.target.value };
                      setRows(next);
                    }}
                  />
                  {rows.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-btn border-line px-2 text-[11px]"
                      onClick={() => setRows(rows.filter((_, i) => i !== idx))}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-2 h-7 rounded-btn border-line text-[11px]"
              onClick={() => setRows([...rows, { productId: "", quantity: "1" }])}
            >
              + Adicionar produto
            </Button>
          </div>
          <Button type="submit" className="mt-2 rounded-btn bg-brand text-white hover:bg-brand-dark" disabled={loading}>
            {loading && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            Criar kit
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
