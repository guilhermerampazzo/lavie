"use client";

import { useState } from "react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { useApiClient, ApiError } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";

export function InviteActions({ resellerId, resellerName }: { resellerId: string; resellerName: string }) {
  const apiFetch = useApiClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<{ email: string; tempPassword: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch<{ user: { email: string }; tempPassword: string }>(
        `/resellers/${resellerId}/invite`,
        { method: "POST", body: JSON.stringify({ email: email.trim() }) },
      );
      setResult({ email: res.user.email, tempPassword: res.tempPassword });
      toast.success("Acesso ao portal liberado.");
    } catch (err) {
      toast.error(err instanceof ApiError && err.status === 409 ? "Já existe um usuário com esse e-mail." : "Não foi possível liberar o acesso.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v: boolean) => {
        setOpen(v);
        if (!v) {
          setResult(null);
          setEmail("");
        }
      }}
    >
      <SheetTrigger asChild>
        <Button type="button" variant="outline" className="h-[30px] gap-1 rounded-md border-line px-3 text-[11.5px]">
          <KeyRound className="size-3.5" />
          Liberar acesso
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Liberar acesso ao portal</SheetTitle>
          <SheetDescription>Cria o login de {resellerName} para o Portal da Revendedora.</SheetDescription>
        </SheetHeader>
        {result ? (
          <div className="flex flex-col gap-3 px-4">
            <p className="text-[12.5px] text-muted-foreground">
              Envie essas credenciais para a revendedora — a senha não fica salva em nenhum outro lugar.
            </p>
            <div className="rounded-lg border border-line bg-canvas p-3 text-[12.5px]">
              <p><span className="font-medium">E-mail:</span> {result.email}</p>
              <p><span className="font-medium">Senha temporária:</span> {result.tempPassword}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-3.5 px-4">
            <Input
              type="email"
              placeholder="e-mail da revendedora"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <SheetFooter className="px-0">
              <Button type="submit" disabled={loading} className="bg-brand text-white hover:bg-brand-dark">
                {loading ? "Criando…" : "Criar acesso"}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
