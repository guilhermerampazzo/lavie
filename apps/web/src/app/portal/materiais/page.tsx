import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { PortalShell } from "@/components/portal/portal-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, Image as ImageIcon, Link2, Library } from "lucide-react";
import type { SupportMaterial } from "@/types/portal";

const KIND_ICON = {
  text: FileText,
  image: ImageIcon,
  pdf: Link2,
} as const;

export default async function PortalMateriaisPage() {
  const session = await auth();
  const materials = await apiServerFetch<SupportMaterial[]>("/portal/materials").catch(
    () => [] as SupportMaterial[],
  );

  return (
    <PortalShell resellerName={session?.user?.name ?? ""}>
      <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Materiais de apoio</h1>
      <p className="mb-5 text-[12.5px] text-muted-foreground">
        Fotos, legendas e documentos prontos para você divulgar as peças La Vie.
      </p>

      {materials.length === 0 ? (
        <EmptyState
          icon={Library}
          title="Materiais em breve"
          description="A equipe La Vie está preparando a biblioteca de divulgação. Volte em breve!"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((m) => {
            const Icon = KIND_ICON[m.kind] ?? FileText;
            return (
              <div key={m.id} className="rounded-xl border border-line bg-surface p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="size-4 text-brand-dark" />
                  <span className="text-[13px] font-medium text-ink">{m.title}</span>
                </div>
                <p className="whitespace-pre-line text-[12px] leading-relaxed text-muted-foreground">
                  {m.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </PortalShell>
  );
}
