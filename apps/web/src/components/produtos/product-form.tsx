"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { renderProduct } from "@lavie/product-template";
import { toast } from "sonner";
import { Camera, FileText, Loader2, PenLine, Sparkles } from "lucide-react";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ProductTemplate,
  Category,
  Product,
  Supplier,
  ProductImageAnalysis,
  InvoiceExtraction,
  ProductChannelType,
} from "@/types/product";

const productSchema = z.object({
  templateId: z.string().optional(),
  nomePeca: z.string().optional(),
  banhoMaterial: z.string().optional(),
  cor: z.string().optional(),
  tamanho: z.string().optional(),
  fecho: z.string().optional(),
  hipoalergenico: z.boolean(),
  skuInterno: z.string().optional(),
  tags: z.array(z.string()).default([]),
  tipoPeca: z.string().optional(),
  material: z.string().optional(),
  corAcabamento: z.string().optional(),
  estilo: z.string().optional(),
  colecao: z.string().optional(),
  instrucoesConservacao: z.string().optional(),
  descricaoSugerida: z.string().optional(),
  precoCusto: z.coerce.number().positive().optional(),
  precoBase: z.coerce.number().positive("Informe um preço válido"),
  precoRevendedora: z.coerce.number().positive().optional(),
  precoPromocional: z.coerce.number().positive().optional(),
  estoqueMinimo: z.coerce.number().int().min(0).default(0),
  pesoGramas: z.coerce.number().positive().optional(),
  dimensoes: z.string().optional(),
  dataEntrada: z.string().optional(),
  supplierId: z.string().optional(),
  canais: z.array(z.string()).default(["site"]),
  categoryId: z.string().optional(),
  sku: z.string().min(1, "Informe o SKU"),
  estoque: z.coerce.number().int().min(0),
});

type ProductFormValues = z.infer<typeof productSchema>;

const CHANNEL_OPTIONS: Array<{ value: ProductChannelType; label: string }> = [
  { value: "site", label: "Site" },
  { value: "nuvemshop", label: "Nuvemshop" },
  { value: "instagram", label: "Instagram Shop" },
  { value: "tiktok", label: "TikTok Shop" },
  { value: "mercado_livre", label: "Mercado Livre" },
  { value: "shopee", label: "Shopee" },
  { value: "amazon", label: "Amazon" },
  { value: "shein", label: "Shein" },
  { value: "revendedora", label: "Revendedoras" },
  { value: "fisico", label: "Físico / PDV" },
];

const TIPO_PECA_OPTIONS = [
  "anel",
  "brinco",
  "colar",
  "pulseira",
  "pingente",
  "broche",
  "outro",
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProductForm({
  templates,
  categories,
  suppliers,
  initial,
  channelStatus,
}: {
  templates: ProductTemplate[];
  categories: Category[];
  suppliers: Supplier[];
  initial?: Product | null;
  channelStatus?: Record<string, { hasCredentials: boolean }>;
}) {
  const router = useRouter();
  const apiFetch = useApiClient();
  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [invoicePreview, setInvoicePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(initial ? "manual" : "foto");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const invoiceInputRef = useRef<HTMLInputElement>(null);

  const defaultTemplate = templates.find((t) => t.isDefault) ?? templates[0];

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      templateId: initial?.templateId ?? defaultTemplate?.id ?? "",
      nomePeca: initial?.nomePeca ?? "",
      banhoMaterial: initial?.banhoMaterial ?? "",
      cor: initial?.cor ?? "",
      tamanho: initial?.tamanho ?? "",
      fecho: initial?.fecho ?? "",
      hipoalergenico: initial?.hipoalergenico ?? true,
      skuInterno: initial?.skuInterno ?? "",
      tags: initial?.tags ?? [],
      tipoPeca: initial?.tipoPeca ?? "",
      material: initial?.material ?? "",
      corAcabamento: initial?.corAcabamento ?? "",
      estilo: initial?.estilo ?? "",
      colecao: initial?.colecao ?? "",
      instrucoesConservacao: initial?.instrucoesConservacao ?? "",
      descricaoSugerida: initial?.descricaoGerada ?? "",
      precoCusto: initial?.precoCusto ? Number(initial.precoCusto) : undefined,
      precoBase: initial ? Number(initial.precoBase) : undefined,
      precoRevendedora: initial?.precoRevendedora ? Number(initial.precoRevendedora) : undefined,
      precoPromocional: initial?.precoPromocional ? Number(initial.precoPromocional) : undefined,
      estoqueMinimo: initial?.estoqueMinimo ?? 0,
      pesoGramas: initial?.pesoGramas ?? undefined,
      dimensoes: initial?.dimensoes ?? "",
      supplierId: initial?.supplierId ?? "",
      canais: initial?.canais.length ? initial.canais.map((c) => c.channel) : ["site"],
      categoryId: initial?.categoryId ?? "",
      sku: initial?.variants[0]?.sku ?? "",
      estoque: initial?.variants[0]?.estoque ?? 0,
    } as ProductFormValues,
  });

  const values = watch() as ProductFormValues & { tags: string[]; canais: string[] };
  const selectedTemplate = templates.find((t) => t.id === values.templateId);

  const preview = useMemo(() => {
    if (selectedTemplate && values.nomePeca && values.banhoMaterial && values.cor) {
      return renderProduct(selectedTemplate, {
        nomePeca: values.nomePeca,
        banhoMaterial: values.banhoMaterial,
        cor: values.cor,
        tamanho: values.tamanho,
        fecho: values.fecho,
        hipoalergenico: values.hipoalergenico,
      });
    }
    if (values.descricaoSugerida) {
      return {
        nome: values.nomePeca || values.skuInterno || "Produto sem nome",
        descricao: values.descricaoSugerida,
      };
    }
    return null;
  }, [selectedTemplate, values.nomePeca, values.banhoMaterial, values.cor, values.tamanho, values.fecho, values.hipoalergenico, values.descricaoSugerida, values.skuInterno]);

  function applyAnalysis(a: ProductImageAnalysis) {
    if (a.erro) {
      toast.error(`A IA não identificou uma peça de joia: ${a.erro}`);
      return;
    }
    const set = (key: string, value: unknown) => {
      if (value !== null && value !== undefined && value !== "") {
        setValue(key as never, value as never, { shouldDirty: true });
      }
    };
    set("nomePeca", a.nomePeca);
    set("tipoPeca", a.tipoPeca);
    set("material", a.material);
    set("banhoMaterial", a.banhoMaterial);
    set("corAcabamento", a.corAcabamento);
    set("cor", a.cor);
    set("tamanho", a.tamanho);
    set("fecho", a.fecho);
    set("estilo", a.estilo);
    set("colecao", a.colecao);
    set("descricaoSugerida", a.descricaoSugerida);
    set("hipoalergenico", a.hipoalergenico);
    if (Array.isArray(a.estiloTags) && a.estiloTags.length) {
      setValue("tags", a.estiloTags, { shouldDirty: true });
    }
    setActiveTab("manual");
    toast.success("Ficha preenchida pela IA — revise e complete os campos que faltam.");
  }

  function applyInvoice(extraction: InvoiceExtraction) {
    if (extraction.erro) {
      toast.error(`Não foi possível ler a nota: ${extraction.erro}`);
      return;
    }
    const supplier = extraction.fornecedor;
    if (supplier?.name || supplier?.document) {
      // Se o fornecedor já veio resolvido (supplierId), usa; senão busca por nome
      if (extraction.supplierId) {
        setValue("supplierId", extraction.supplierId, { shouldDirty: true });
      } else {
        const match = suppliers.find(
          (s) =>
            s.document === supplier?.document ||
            (supplier?.name && s.name.toLowerCase().includes(supplier.name.toLowerCase())),
        );
        if (match) setValue("supplierId", match.id, { shouldDirty: true });
      }
    }
    const firstItem = extraction.itens?.[0];
    if (firstItem) {
      if (firstItem.nome && !getValues("nomePeca")) {
        setValue("nomePeca", firstItem.nome, { shouldDirty: true });
      }
      if (firstItem.codigo && !getValues("skuInterno")) {
        setValue("skuInterno", firstItem.codigo, { shouldDirty: true });
      }
      if (firstItem.precoUnitario > 0) {
        setValue("precoCusto", firstItem.precoUnitario, { shouldDirty: true });
      }
      if (firstItem.quantidade > 0) {
        setValue("estoque", firstItem.quantidade, { shouldDirty: true });
      }
    }
    if (extraction.dataEmissao) {
      setValue("dataEntrada", extraction.dataEmissao, { shouldDirty: true });
    }
    toast.success(
      extraction.itens?.length
        ? `Nota lida: ${extraction.itens.length} item(ns) e fornecedor identificados.`
        : "Nota lida — preencha os itens manualmente se necessário.",
    );
  }

  async function onAnalyzePhoto(file: File) {
    setAnalyzing(true);
    try {
      const base64 = await fileToBase64(file);
      setPhotoPreview(`data:${file.type};base64,${base64}`);
      const result = await apiFetch<ProductImageAnalysis>("/products/analyze-image", {
        method: "POST",
        body: JSON.stringify({ image: base64, mime: file.type || "image/jpeg" }),
      });
      applyAnalysis(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao analisar a foto.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function onExtractInvoice(file: File) {
    setExtracting(true);
    try {
      const base64 = await fileToBase64(file);
      setInvoicePreview(`data:${file.type};base64,${base64}`);
      const result = await apiFetch<InvoiceExtraction>("/products/extract-invoice", {
        method: "POST",
        body: JSON.stringify({ image: base64, mime: file.type || "image/jpeg" }),
      });
      applyInvoice(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao ler a nota fiscal.");
    } finally {
      setExtracting(false);
    }
  }

  async function onSubmit(formValues: ProductFormValues, publish: boolean) {
    setSubmitting(publish ? "publish" : "draft");
    try {
      const payload = {
        templateId: formValues.templateId || undefined,
        nomePeca: formValues.nomePeca || undefined,
        banhoMaterial: formValues.banhoMaterial || undefined,
        cor: formValues.cor || undefined,
        tamanho: formValues.tamanho || undefined,
        fecho: formValues.fecho || undefined,
        hipoalergenico: formValues.hipoalergenico,
        skuInterno: formValues.skuInterno || undefined,
        tags: formValues.tags,
        tipoPeca: formValues.tipoPeca || undefined,
        material: formValues.material || undefined,
        corAcabamento: formValues.corAcabamento || undefined,
        estilo: formValues.estilo || undefined,
        colecao: formValues.colecao || undefined,
        instrucoesConservacao: formValues.instrucoesConservacao || undefined,
        descricaoSugerida: formValues.descricaoSugerida || undefined,
        precoCusto: formValues.precoCusto || undefined,
        precoBase: formValues.precoBase,
        precoRevendedora: formValues.precoRevendedora || undefined,
        precoPromocional: formValues.precoPromocional || undefined,
        estoqueMinimo: formValues.estoqueMinimo ?? 0,
        pesoGramas: formValues.pesoGramas || undefined,
        dimensoes: formValues.dimensoes || undefined,
        supplierId: formValues.supplierId || undefined,
        canais: formValues.canais.length ? formValues.canais : ["site"],
        categoryId: formValues.categoryId || undefined,
        variants: [{ sku: formValues.sku, preco: formValues.precoBase, estoque: formValues.estoque }],
      };

      let product: Product;
      if (initial) {
        product = await apiFetch<Product>(`/products/${initial.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        product = await apiFetch<Product>("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      if (publish) {
        await apiFetch(`/products/${product.id}/publish`, { method: "POST" });
        toast.success("Produto publicado na Nuvemshop.");
      } else {
        toast.success(initial ? "Produto atualizado." : "Produto salvo em revisão.");
      }
      router.push("/produtos");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : publish
            ? "Não foi possível publicar. Verifique a integração com a Nuvemshop em Configurações."
            : "Não foi possível salvar o produto.",
      );
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="px-5 py-6 lg:px-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">
            {initial ? "Editar produto" : "Novo produto"}
          </h1>
          <p className="text-[12.5px] text-muted-foreground">
            Cadastro inteligente: comece por foto (IA), nota fiscal (OCR) ou manualmente — a ficha é sempre a mesma.
          </p>
        </div>
        <div className="hidden gap-2 lg:flex">
          <Button
            variant="outline"
            className="rounded-btn border-line"
            disabled={submitting !== null}
            onClick={handleSubmit((v) => onSubmit(v, false))}
          >
            {submitting === "draft" ? "Salvando…" : initial ? "Salvar" : "Salvar em revisão"}
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-5">
        <TabsList variant="line" className="w-full justify-start border-b border-line rounded-none">
          <TabsTrigger value="foto" className="gap-1.5">
            <Camera className="size-3.5" /> Foto (IA)
          </TabsTrigger>
          <TabsTrigger value="nota" className="gap-1.5">
            <FileText className="size-3.5" /> Nota fiscal (OCR)
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-1.5">
            <PenLine className="size-3.5" /> Manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="foto" className="mt-4">
          <div className="rounded-xl border border-dashed border-line bg-surface p-6 text-center">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onAnalyzePhoto(file);
              }}
            />
            {photoPreview ? (
              <div className="flex flex-col items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="Foto da peça" className="max-h-56 rounded-lg object-contain" />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="rounded-btn border-line"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={analyzing}
                  >
                    Trocar foto
                  </Button>
                  {analyzing && (
                    <Button className="rounded-btn bg-brand text-white" disabled>
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" /> Analisando com IA…
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 py-8"
                disabled={analyzing}
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand-dark">
                  <Sparkles className="size-5" />
                </span>
                <span className="text-[13px] font-medium text-ink">Envie a foto da peça</span>
                <span className="text-[12px] text-muted-foreground">
                  A IA identifica tipo, material, cor, estilo e sugere nome e descrição
                </span>
              </button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="nota" className="mt-4">
          <div className="rounded-xl border border-dashed border-line bg-surface p-6 text-center">
            <input
              ref={invoiceInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onExtractInvoice(file);
              }}
            />
            {invoicePreview ? (
              <div className="flex flex-col items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={invoicePreview} alt="Nota fiscal" className="max-h-56 rounded-lg object-contain" />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="rounded-btn border-line"
                    onClick={() => invoiceInputRef.current?.click()}
                    disabled={extracting}
                  >
                    Trocar nota
                  </Button>
                  {extracting && (
                    <Button className="rounded-btn bg-brand text-white" disabled>
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" /> Lendo nota…
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => invoiceInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 py-8"
                disabled={extracting}
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand-dark">
                  <FileText className="size-5" />
                </span>
                <span className="text-[13px] font-medium text-ink">Envie a nota fiscal do fornecedor</span>
                <span className="text-[12px] text-muted-foreground">
                  O OCR extrai fornecedor, CNPJ, código, quantidade e preço de custo dos itens
                </span>
              </button>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <form className="rounded-xl border border-line bg-surface p-5">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Identificação
          </p>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Nome da peça</Label>
              <Input
                className="h-9 rounded-[9px] border-line text-[12.5px]"
                placeholder="Pulseira Riviera Majesté"
                {...register("nomePeca")}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Tipo de peça</Label>
              <Controller
                control={control}
                name="tipoPeca"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger className="h-9 rounded-[9px] border-line text-[12.5px]">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPO_PECA_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">SKU interno (gerado se vazio)</Label>
              <Input
                className="h-9 rounded-[9px] border-line text-[12.5px]"
                placeholder="PUL-XXXX"
                {...register("skuInterno")}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Coleção</Label>
              <Input className="h-9 rounded-[9px] border-line text-[12.5px]" placeholder="Majesté" {...register("colecao")} />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Material / composição</Label>
              <Input
                className="h-9 rounded-[9px] border-line text-[12.5px]"
                placeholder="Aço inox, prata 925…"
                {...register("material")}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Banho / acabamento</Label>
              <Input
                className="h-9 rounded-[9px] border-line text-[12.5px]"
                placeholder="Banho de Ródio Branco"
                {...register("banhoMaterial")}
              />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Cor / acabamento</Label>
              <Input className="h-9 rounded-[9px] border-line text-[12.5px]" placeholder="Dourado" {...register("corAcabamento")} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Cor comercial</Label>
              <Input className="h-9 rounded-[9px] border-line text-[12.5px]" placeholder="Prata" {...register("cor")} />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Tamanho</Label>
              <Input className="h-9 rounded-[9px] border-line text-[12.5px]" placeholder="18cm" {...register("tamanho")} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Fecho</Label>
              <Input className="h-9 rounded-[9px] border-line text-[12.5px]" placeholder="fecho joia" {...register("fecho")} />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Estilo</Label>
              <Input className="h-9 rounded-[9px] border-line text-[12.5px]" placeholder="clássico, boho…" {...register("estilo")} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Peso (g)</Label>
              <Input
                className="h-9 rounded-[9px] border-line text-[12.5px]"
                type="number"
                step="0.1"
                placeholder="12.5"
                {...register("pesoGramas")}
              />
            </div>
          </div>

          <div className="mb-4">
            <Label className="mb-1.5 block text-xs font-medium">Dimensões</Label>
            <Input className="h-9 rounded-[9px] border-line text-[12.5px]" placeholder="2cm x 2cm x 3cm" {...register("dimensoes")} />
          </div>

          <div className="mb-4">
            <Label className="mb-1.5 block text-xs font-medium">Tags de busca</Label>
            <Input
              className="h-9 rounded-[9px] border-line text-[12.5px]"
              placeholder="pulseira, banho de ródio, hipoalergênico (separadas por vírgula)"
              defaultValue={values.tags.join(", ")}
              onBlur={(e) =>
                setValue(
                  "tags",
                  e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                  { shouldDirty: true },
                )
              }
            />
          </div>

          <div className="mb-4 flex items-center gap-2">
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
            Preços e estoque
          </p>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Preço de custo (R$) — OCR</Label>
              <Input
                className="h-9 rounded-[9px] border-line text-[12.5px]"
                type="number"
                step="0.01"
                placeholder="45,00"
                {...register("precoCusto")}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Preço de venda (R$)</Label>
              <Input
                className="h-9 rounded-[9px] border-line text-[12.5px]"
                type="number"
                step="0.01"
                placeholder="189,90"
                {...register("precoBase")}
              />
              {errors.precoBase && <p className="mt-1 text-xs text-danger">{errors.precoBase.message}</p>}
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Preço revendedora</Label>
              <Input
                className="h-9 rounded-[9px] border-line text-[12.5px]"
                type="number"
                step="0.01"
                {...register("precoRevendedora")}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Preço promocional</Label>
              <Input
                className="h-9 rounded-[9px] border-line text-[12.5px]"
                type="number"
                step="0.01"
                {...register("precoPromocional")}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Estoque mínimo</Label>
              <Input
                className="h-9 rounded-[9px] border-line text-[12.5px]"
                type="number"
                {...register("estoqueMinimo")}
              />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">SKU da variante</Label>
              <Input className="h-9 rounded-[9px] border-line text-[12.5px]" placeholder="RIV-BRP-P" {...register("sku")} />
              {errors.sku && <p className="mt-1 text-xs text-danger">{errors.sku.message}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Estoque inicial</Label>
              <Input className="h-9 rounded-[9px] border-line text-[12.5px]" type="number" {...register("estoque")} />
            </div>
          </div>

          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Fornecedor, categoria e canais
          </p>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Fornecedor</Label>
              <Controller
                control={control}
                name="supplierId"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger className="h-9 rounded-[9px] border-line text-[12.5px]">
                      <SelectValue placeholder="Selecione (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Categoria</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
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
          </div>

          <div className="mb-4">
            <Label className="mb-1.5 block text-xs font-medium">Template de nome/descrição</Label>
            <Controller
              control={control}
              name="templateId"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className="h-9 rounded-[9px] border-line text-[12.5px]">
                    <SelectValue placeholder="Sem template (texto livre)" />
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
          </div>

          <div className="mb-1">
            <Label className="mb-1.5 block text-xs font-medium">Canais de venda</Label>
            <div className="flex flex-wrap gap-1.5">
              {CHANNEL_OPTIONS.map((c) => {
                const checked = values.canais.includes(c.value);
                const cred = channelStatus?.[c.value];
                const noCreds = !cred?.hasCredentials && !["site", "nuvemshop", "revendedora", "fisico"].includes(c.value);
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      const next = checked
                        ? values.canais.filter((v) => v !== c.value)
                        : [...values.canais, c.value];
                      setValue("canais", next, { shouldDirty: true });
                    }}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      checked
                        ? "border-brand bg-brand text-white"
                        : "border-line bg-surface text-muted-foreground hover:border-brand/50"
                    }`}
                    title={
                      noCreds
                        ? "Sem credenciais configuradas em /configuracoes — a publicação ficará pendente."
                        : c.label
                    }
                  >
                    {c.label}
                    {noCreds && !checked && (
                      <span className="ml-1 text-[9px] font-normal opacity-70">(sem cred.)</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[10.5px] text-muted-foreground">
              Escolha individualmente onde publicar (site, Nuvemshop, marketplaces, revendedoras, PDV). Canais sem
              credenciais ficam marcados — a publicação entra como pendente até configurar em{" "}
              <Link href="/configuracoes" className="underline hover:text-brand-dark">Configurações</Link>.
            </p>
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
                {preview.descricao || "—"}
              </p>
              {values.hipoalergenico && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
                  ✓ Hipoalergênico
                </span>
              )}
              {values.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {values.tags.map((t) => (
                    <span key={t} className="rounded-full bg-brand-soft px-2 py-0.5 text-[10.5px] text-brand-dark">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center text-[12.5px] text-muted-foreground">
              Use a IA por foto, a nota fiscal ou preencha manualmente para ver a prévia.
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
          {initial ? "Salvar" : "Salvar em revisão"}
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
