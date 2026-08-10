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

export function NewSupplierSheet() {
  const router = useRouter();
  const apiFetch = useApiClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    document: "",
    code: "",
    contact: "",
    email: "",
    phone: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Informe o nome do fornecedor.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/suppliers", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          document: form.document.trim() || undefined,
          code: form.code.trim() || undefined,
          contact: form.contact.trim() || undefined,
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
        }),
      });
      toast.success("Fornecedor cadastrado.");
      setOpen(false);
      setForm({ name: "", document: "", code: "", contact: "", email: "", phone: "" });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível cadastrar o fornecedor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="rounded-btn bg-brand text-white hover:bg-brand-dark">
          <Plus className="mr-1.5 size-3.5" /> Novo fornecedor
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif text-lg text-ink">Novo fornecedor</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <div>
            <Label className="mb-1.5 block text-xs font-medium">Nome *</Label>
            <Input
              className="h-9 rounded-[9px] border-line text-[12.5px]"
              placeholder="Razão social"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium">CNPJ/CPF</Label>
            <Input
              className="h-9 rounded-[9px] border-line text-[12.5px]"
              placeholder="00.000.000/0001-00"
              value={form.document}
              onChange={(e) => setForm({ ...form, document: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium">Código interno</Label>
            <Input
              className="h-9 rounded-[9px] border-line text-[12.5px]"
              placeholder="FORN-001"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium">Contato</Label>
            <Input
              className="h-9 rounded-[9px] border-line text-[12.5px]"
              placeholder="Nome do contato"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">E-mail</Label>
              <Input
                className="h-9 rounded-[9px] border-line text-[12.5px]"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Telefone</Label>
              <Input
                className="h-9 rounded-[9px] border-line text-[12.5px]"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <Button
            type="submit"
            className="mt-2 rounded-btn bg-brand text-white hover:bg-brand-dark"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            Cadastrar
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
