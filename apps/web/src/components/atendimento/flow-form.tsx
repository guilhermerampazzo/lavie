"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const flowSchema = z.object({
  name: z.string().min(1, "Informe um nome"),
  trigger: z.string().min(1, "Informe o gatilho"),
  content: z.string().min(1, "Informe o texto da mensagem"),
});

type FlowFormValues = z.infer<typeof flowSchema>;

export function FlowForm() {
  const apiFetch = useApiClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(flowSchema),
  });

  async function onSubmit(values: FlowFormValues) {
    setSubmitting(true);
    try {
      await apiFetch("/message-templates", { method: "POST", body: JSON.stringify(values) });
      toast.success("Fluxo criado.");
      reset();
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Não foi possível criar o fluxo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="rounded-btn bg-brand text-white hover:bg-brand-dark">
        Novo fluxo
      </Button>
    );
  }

  return (
    <div className="mb-5 rounded-xl border border-line bg-surface p-4">
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs font-medium">Nome</Label>
          <Input className="h-9 rounded-[9px] border-line text-[12.5px]" placeholder="Boas-vindas" {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div>
          <Label className="mb-1.5 block text-xs font-medium">Gatilho</Label>
          <Input
            className="h-9 rounded-[9px] border-line text-[12.5px]"
            placeholder="novo_cliente, pedido_pago, aniversario..."
            {...register("trigger")}
          />
          {errors.trigger && <p className="mt-1 text-xs text-danger">{errors.trigger.message}</p>}
        </div>
      </div>
      <div className="mb-3">
        <Label className="mb-1.5 block text-xs font-medium">Mensagem</Label>
        <Textarea className="min-h-20 rounded-[9px] border-line text-[12.5px]" {...register("content")} />
        {errors.content && <p className="mt-1 text-xs text-danger">{errors.content.message}</p>}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          disabled={submitting}
          onClick={handleSubmit(onSubmit)}
          className="rounded-btn bg-brand text-white hover:bg-brand-dark"
        >
          {submitting ? "Criando…" : "Criar fluxo"}
        </Button>
        <Button type="button" variant="outline" className="rounded-btn border-line" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
