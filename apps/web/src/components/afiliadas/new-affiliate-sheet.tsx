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

const emptyForm = { name: "", handle: "", channel: "", followers: "", email: "", phone: "" };

export function NewAffiliateSheet() {
  const apiFetch = useApiClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Informe o nome da afiliada.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/affiliates", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          handle: form.handle.trim() || undefined,
          channel: form.channel.trim() || undefined,
          followers: form.followers ? Number(form.followers) : undefined,
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
        }),
      });
      toast.success("Afiliada cadastrada.");
      setForm(emptyForm);
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Não foi possível cadastrar a afiliada.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="h-9 gap-1.5 rounded-md bg-brand px-3.5 text-[12.5px] text-white hover:bg-brand-dark">
          <Plus className="size-4" />
          Nova afiliada
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nova afiliada</SheetTitle>
          <SheetDescription>Cadastre uma influenciadora ou parceira para acompanhar links e comissões.</SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="aff-name">Nome *</Label>
            <Input id="aff-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="aff-handle">@handle</Label>
            <Input id="aff-handle" value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} placeholder="@usuaria" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="aff-channel">Canal</Label>
            <Input id="aff-channel" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} placeholder="Instagram, TikTok..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="aff-followers">Seguidores</Label>
            <Input id="aff-followers" type="number" min="0" value={form.followers} onChange={(e) => setForm({ ...form, followers: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="aff-email">E-mail</Label>
            <Input id="aff-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="aff-phone">Telefone</Label>
            <Input id="aff-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <SheetFooter className="px-0">
            <Button type="submit" disabled={loading} className="bg-brand text-white hover:bg-brand-dark">
              {loading ? "Salvando…" : "Cadastrar afiliada"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
