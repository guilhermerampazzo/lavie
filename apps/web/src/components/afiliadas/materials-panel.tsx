"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Image as ImageIcon, Link2, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface AffiliateMaterialItem {
  id: string;
  title: string;
  kind: "text" | "image" | "pdf";
  content: string;
  createdAt: string;
}

const KIND_LABEL: Record<AffiliateMaterialItem["kind"], string> = {
  text: "Texto",
  image: "Imagem",
  pdf: "PDF",
};

/** Biblioteca de material de divulgação (escopofinal.md 5.3). */
export function MaterialsPanel({
  materials,
  affiliateId,
}: {
  materials: AffiliateMaterialItem[];
  affiliateId?: string;
}) {
  const router = useRouter();
  const apiFetch = useApiClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", kind: "text" as AffiliateMaterialItem["kind"], content: "" });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Preencha título e conteúdo.");
      return;
    }
    setLoading(true);
    try {
      const path = affiliateId ? `/affiliates/${affiliateId}/materials` : "/affiliates/materials";
      await apiFetch(path, {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          kind: form.kind,
          content: form.content.trim(),
        }),
      });
      toast.success("Material adicionado à biblioteca.");
      setOpen(false);
      setForm({ title: "", kind: "text", content: "" });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível adicionar o material.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Remover este material da biblioteca?")) return;
    try {
      await apiFetch(`/affiliates/materials/${id}`, { method: "DELETE" });
      toast.success("Material removido.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível remover.");
    }
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Material de divulgação
        </p>
        <Button
          variant="outline"
          className="h-7 rounded-btn border-line px-2 text-[11px]"
          onClick={() => setOpen((v) => !v)}
        >
          <Plus className="mr-1 size-3" /> Adicionar
        </Button>
      </div>

      {open && (
        <form onSubmit={handleCreate} className="mb-4 flex flex-col gap-2.5 rounded-lg border border-line bg-canvas p-3">
          <div>
            <Label className="mb-1 block text-[11px] font-medium">Título</Label>
            <Input
              className="h-8 rounded-[9px] border-line text-[12px]"
              placeholder="Legenda para post do colar Riviera"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(["text", "image", "pdf"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setForm({ ...form, kind: k })}
                className={`rounded-lg border px-2 py-1.5 text-[11px] font-medium capitalize transition-colors ${
                  form.kind === k
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-surface text-muted-foreground"
                }`}
              >
                {k === "text" ? "Texto" : k === "image" ? "Imagem (URL)" : "PDF (URL)"}
              </button>
            ))}
          </div>
          <div>
            <Label className="mb-1 block text-[11px] font-medium">
              {form.kind === "text" ? "Texto pronto para uso" : "URL do arquivo"}
            </Label>
            <textarea
              className="min-h-20 w-full rounded-[9px] border border-line bg-surface p-2 text-[12px] outline-none focus:border-brand"
              placeholder={
                form.kind === "text"
                  ? "✨ Legenda pronta: \"Essa peça é um arraso...\""
                  : "https://painel.usejoiaslavie.com.br/arquivos/..."
              }
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>
          <Button type="submit" className="h-8 rounded-btn bg-brand text-white hover:bg-brand-dark" disabled={loading}>
            {loading && <Loader2 className="mr-1.5 size-3 animate-spin" />}
            Salvar material
          </Button>
        </form>
      )}

      {materials.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">
          Nenhum material ainda — adicione legendas prontas, fotos e PDFs para as parceiras usarem.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {materials.map((m) => {
            const Icon = m.kind === "text" ? FileText : m.kind === "image" ? ImageIcon : Link2;
            return (
              <div key={m.id} className="group flex items-start gap-2.5 rounded-lg border border-line px-3 py-2">
                <Icon className="mt-0.5 size-3.5 shrink-0 text-brand-dark" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-ink">{m.title}</p>
                  <p className="mt-0.5 line-clamp-2 whitespace-pre-line text-[11px] text-muted-foreground">
                    {m.content}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[9.5px] font-medium uppercase text-brand-dark">
                    {KIND_LABEL[m.kind]}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(m.id)}
                    className="text-muted-foreground opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                    title="Remover"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
