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

export function NewAccountSheet() {
  const router = useRouter();
  const apiFetch = useApiClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "receivable" as "receivable" | "payable",
    description: "",
    amount: "",
    dueDate: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim() || !form.amount || !form.dueDate) {
      toast.error("Preencha descrição, valor e vencimento.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/finance/accounts", {
        method: "POST",
        body: JSON.stringify({
          type: form.type,
          description: form.description.trim(),
          amount: Number(form.amount),
          dueDate: new Date(form.dueDate).toISOString(),
        }),
      });
      toast.success("Conta lançada.");
      setOpen(false);
      setForm({ type: "receivable", description: "", amount: "", dueDate: "" });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível lançar a conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="rounded-btn bg-brand text-white hover:bg-brand-dark">
          <Plus className="mr-1.5 size-3.5" /> Nova conta
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif text-lg text-ink">Lançar conta</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {(["receivable", "payable"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, type: t })}
                className={`rounded-lg border px-2 py-2 text-[12px] font-medium capitalize transition-colors ${
                  form.type === t
                    ? t === "receivable"
                      ? "border-success bg-success/10 text-success"
                      : "border-danger bg-danger/10 text-danger"
                    : "border-line text-muted-foreground"
                }`}
              >
                {t === "receivable" ? "A receber" : "A pagar"}
              </button>
            ))}
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium">Descrição</Label>
            <Input
              className="h-9 rounded-[9px] border-line text-[12.5px]"
              placeholder="Venda #123 · Fornecedor X · Comissão…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Valor (R$)</Label>
              <Input
                className="h-9 rounded-[9px] border-line text-[12.5px]"
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Vencimento</Label>
              <Input
                className="h-9 rounded-[9px] border-line text-[12.5px]"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>
          <Button type="submit" className="mt-2 rounded-btn bg-brand text-white hover:bg-brand-dark" disabled={loading}>
            {loading && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            Lançar conta
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
