"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { renderProduct } from "@lavie/product-template";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductTemplate, Category, Product } from "@/types/product";

const productSchema = z.object({
  templateId: z.string().min(1, "Selecione um template"),
  nomePeca: z.string().min(1, "Informe o nome da peça"),
  banhoMaterial: z.string().min(1, "Informe o banho/material"),
  cor: z.string().min(1, "Informe a cor"),
  tamanho: z.string().optional(),
  fecho: z.string().optional(),
  hipoalergenico: z.boolean(),
  categoryId: z.string().optional(),
  precoBase: z.coerce.number().positive("Informe um preço válido"),
  sku: z.string().min(1, "Informe o SKU"),
  estoque: z.coerce.number().int().min(0),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function ProductForm({
  templates,
  categories,
}: {
  templates: ProductTemplate[];
  categories: Category[];
}) {
  const router = useRouter();
  const apiFetch = useApiClient();
  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(null);

  const defaultTemplate = templates.find((t) => t.isDefault) ?? templates[0];

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      templateId: defaultTemplate?.id ?? "",
      hipoalergenico: true,
      estoque: 0,
    } as ProductFormValues,
  });

  const values = watch();
  const selectedTemplate = templates.find((t) => t.id === values.templateId);

  const preview = useMemo(() => {
    if (!selectedTemplate || !values.nomePeca || !values.banhoMaterial || !values.cor) {
      return null;
    }
    return renderProduct(selectedTemplate, {
      nomePeca: values.nomePeca,
      banhoMaterial: values.banhoMaterial,
      cor: values.cor,
      tamanho: values.tamanho,
      fecho: values.fecho,
      hipoalergenico: values.hipoalergenico,
    });
  }, [selectedTemplate, values.nomePeca, values.banhoMaterial, values.cor, values.tamanho, values.fecho, values.hipoalergenico]);

  async function onSubmit(values: ProductFormValues, publish: boolean) {
    setSubmitting(publish ? "publish" : "draft");
    try {
      const product = await apiFetch<Product>("/products", {
        method: "POST",
        body: JSON.stringify({
          templateId: values.templateId,
          nomePeca: values.nomePeca,
          banhoMaterial: values.banhoMaterial,
          cor: values.cor,
          tamanho: values.tamanho || undefined,
          fecho: values.fecho || undefined,
          hipoalergenico: values.hipoalergenico,
          categoryId: values.categoryId || undefined,
          precoBase: values.precoBase,
          variants: [{ sku: values.sku, preco: values.precoBase, estoque: values.estoque }],
        }),
      });

      if (publish) {
        await apiFetch(`/products/${product.id}/publish`, { method: "POST" });
        toast.success("Produto publicado na Nuvemshop.");
      } else {
        toast.success("Produto salvo como rascunho.");
      }
      router.push("/produtos");
      router.refresh();
    } catch {
      toast.error(
        publish
          ? "Não foi possível publicar. Verifique a integração com a Nuvemshop em Configurações."
          : "Não foi possível salvar o produto.",
      );
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="px-5 py-6 lg:px-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Novo produto</h1>
          <p className="text-[12.5px] text-muted-foreground">
            Preencha os campos variáveis — nome e descrição são montados pelo template.
          </p>
        </div>
        <div className="hidden gap-2 lg:flex">
          <Button
            variant="outline"
            className="rounded-btn border-line"
            disabled={submitting !== null}
            onClick={handleSubmit((v) => onSubmit(v, false))}
          >
            {submitting === "draft" ? "Salvando…" : "Salvar rascunho"}
          </Button>
          <Button
            className="rounded-btn bg-brand text-white hover:bg-brand-dark"
            disabled={submitting !== null}
            onClick={handleSubmit((v) => onSubmit(v, true))}
          >
            {submitting === "publish" ? "Publicando…" : "Publicar na Nuvemshop"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <form className="rounded-xl border border-line bg-surface p-5">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Campos do template
          </p>

          <div className="mb-4">
            <Label className="mb-1.5 block text-xs font-medium">Template</Label>
            <Controller
              control={control}
              name="templateId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-9 rounded-[9px] border-line text-[12.5px]">
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.templateId && <p className="mt-1 text-xs text-danger">{errors.templateId.message}</p>}
          </div>

          <div className="mb-4">
            <Label className="mb-1.5 block text-xs font-medium">Nome da peça</Label>
            <Input
              className="h-9 rounded-[9px] border-line text-[12.5px]"
              placeholder="Pulseira Riviera Majesté"
              {...register("nomePeca")}
            />
            {errors.nomePeca && <p className="mt-1 text-xs text-danger">{errors.nomePeca.message}</p>}
          </div>

          <div className="mb-4">
            <Label className="mb-1.5 block text-xs font-medium">Banho / material</Label>
            <Input
              className="h-9 rounded-[9px] border-line text-[12.5px]"
              placeholder="Banho de Ródio Branco"
              {...register("banhoMaterial")}
            />
            {errors.banhoMaterial && (
              <p className="mt-1 text-xs text-danger">{errors.banhoMaterial.message}</p>
            )}
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Cor</Label>
              <Input className="h-9 rounded-[9px] border-line text-[12.5px]" placeholder="Prata" {...register("cor")} />
              {errors.cor && <p className="mt-1 text-xs text-danger">{errors.cor.message}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Tamanho / fecho</Label>
              <Input
                className="h-9 rounded-[9px] border-line text-[12.5px]"
                placeholder="18cm, fecho joia"
                {...register("tamanho")}
              />
            </div>
          </div>

          <div className="mb-5 flex items-center gap-2">
            <Controller
              control={control}
              name="hipoalergenico"
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={field.onChange} id="hipoalergenico" />
              )}
            />
            <Label htmlFor="hipoalergenico" className="text-[12.5px] font-normal">
              Hipoalergênico
            </Label>
          </div>

          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Variante, preço e categoria
          </p>

          <div className="mb-4 grid grid-cols-3 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">SKU</Label>
              <Input className="h-9 rounded-[9px] border-line text-[12.5px]" placeholder="RIV-BRP-P" {...register("sku")} />
              {errors.sku && <p className="mt-1 text-xs text-danger">{errors.sku.message}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Preço (R$)</Label>
              <Input
                className="h-9 rounded-[9px] border-line text-[12.5px]"
                placeholder="189,90"
                type="number"
                step="0.01"
                {...register("precoBase")}
              />
              {errors.precoBase && <p className="mt-1 text-xs text-danger">{errors.precoBase.message}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Estoque</Label>
              <Input
                className="h-9 rounded-[9px] border-line text-[12.5px]"
                type="number"
                {...register("estoque")}
              />
            </div>
          </div>

          <div className="mb-1">
            <Label className="mb-1.5 block text-xs font-medium">Categoria</Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-9 rounded-[9px] border-line text-[12.5px]">
                    <SelectValue placeholder="Selecione (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </form>

        <div className="rounded-xl bg-canvas p-5">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Preview — como vai para a Nuvemshop
          </p>
          {preview ? (
            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-brand-dark">
                Nome gerado
              </p>
              <p className="mb-4 font-serif text-[16px] font-medium leading-snug text-ink">{preview.nome}</p>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-brand-dark">
                Descrição gerada
              </p>
              <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-ink">
                {preview.descricao}
              </p>
              {values.hipoalergenico && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
                  ✓ Hipoalergênico
                </span>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center text-[12.5px] text-muted-foreground">
              Preencha nome, banho/material e cor para ver a prévia.
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex gap-2 lg:hidden">
        <Button
          variant="outline"
          className="flex-1 rounded-btn border-line"
          disabled={submitting !== null}
          onClick={handleSubmit((v) => onSubmit(v, false))}
        >
          Rascunho
        </Button>
        <Button
          className="flex-1 rounded-btn bg-brand text-white hover:bg-brand-dark"
          disabled={submitting !== null}
          onClick={handleSubmit((v) => onSubmit(v, true))}
        >
          Publicar
        </Button>
      </div>
    </div>
  );
}
