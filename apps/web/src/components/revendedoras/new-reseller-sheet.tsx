"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";

const emptyForm = { name: "", document: "", partnerType: "", city: "", state: "" };

export function NewResellerSheet() {
  const apiFetch = useApiClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Informe o nome da revendedora.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/resellers", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          document: form.document.trim() || undefined,
          partnerType: form.partnerType.trim() || undefined,
          city: form.city.trim() || undefined,
          state: form.state.trim() || undefined,
        }),
      });
      toast.success("Cadastro enviado — aguardando aprovação.");
      setForm(emptyForm);
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Não foi possível cadastrar a revendedora.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="h-9 gap-1.5 rounded-md bg-brand px-3.5 text-[12.5px] text-white hover:bg-brand-dark">
          <Plus className="size-4" />
          Nova revendedora
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nova revendedora</SheetTitle>
          <SheetDescription>O cadastro entra como pendente até ser aprovado.</SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="res-name">Nome *</Label>
            <Input id="res-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="res-document">CPF/CNPJ</Label>
            <Input id="res-document" value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="res-partner-type">Tipo de parceria</Label>
            <Input id="res-partner-type" value={form.partnerType} onChange={(e) => setForm({ ...form, partnerType: e.target.value })} placeholder="Loja física, revenda individual..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="res-city">Cidade</Label>
            <Input id="res-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="res-state">Estado (UF)</Label>
            <Input id="res-state" maxLength={2} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} />
          </div>
          <SheetFooter className="px-0">
            <Button type="submit" disabled={loading} className="bg-brand text-white hover:bg-brand-dark">
              {loading ? "Salvando…" : "Cadastrar revendedora"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
