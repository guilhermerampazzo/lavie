"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ProductTemplate } from "@/types/product";

const templateSchema = z.object({
  openingParagraph: z.string().min(1),
  manufacturingBlock: z.string().min(1),
  careBlock: z.string().min(1),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

export function TemplateEditor({ template }: { template: ProductTemplate }) {
  const apiFetch = useApiClient();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit } = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      openingParagraph: template.openingParagraph,
      manufacturingBlock: template.manufacturingBlock,
      careBlock: template.careBlock,
    } as TemplateFormValues,
  });

  async function onSubmit(values: TemplateFormValues) {
    setSubmitting(true);
    try {
      await apiFetch(`/product-templates/${template.id}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
      toast.success("Template salvo.");
    } catch {
      toast.error("Não foi possível salvar o template.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-[17px] font-medium text-ink">{template.name}</h2>
        <Button
          type="button"
          disabled={submitting}
          onClick={handleSubmit(onSubmit)}
          className="rounded-btn bg-brand text-white hover:bg-brand-dark"
        >
          {submitting ? "Salvando…" : "Salvar template"}
        </Button>
      </div>

      <div className="mb-4">
        <Label className="mb-1.5 block text-xs font-medium">
          Parágrafo de abertura{" "}
          <span className="font-normal text-muted-foreground">
            — use {"{{nomePeca}}"}, {"{{banhoMaterial}}"}, {"{{cor}}"}, {"{{tamanho}}"}
          </span>
        </Label>
        <Textarea className="min-h-28 rounded-[9px] border-line text-[12.5px]" {...register("openingParagraph")} />
      </div>

      <div className="mb-4">
        <Label className="mb-1.5 block text-xs font-medium">Bloco fixo — Processo de fabricação</Label>
        <Textarea className="min-h-28 rounded-[9px] border-line text-[12.5px]" {...register("manufacturingBlock")} />
      </div>

      <div>
        <Label className="mb-1.5 block text-xs font-medium">Bloco fixo — Cuide da sua La Vie</Label>
        <Textarea className="min-h-40 rounded-[9px] border-line text-[12.5px]" {...register("careBlock")} />
      </div>
    </div>
  );
}
