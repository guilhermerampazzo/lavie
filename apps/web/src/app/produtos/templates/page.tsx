import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { TemplateEditor } from "@/components/produtos/template-editor";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";
import type { ProductTemplate } from "@/types/product";

export default async function TemplatesPage() {
  const session = await auth();
  const templates = await apiServerFetch<ProductTemplate[]>("/product-templates").catch(
    () => [] as ProductTemplate[],
  );

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5">
          <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Templates de produto</h1>
          <p className="text-[12.5px] text-muted-foreground">
            Blocos fixos reutilizados no cadastro de produtos — edite sem tocar em código.
          </p>
        </div>

        {templates.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum template cadastrado"
            description="Crie o primeiro template para liberar o cadastro de produtos."
          />
        ) : (
          <div className="flex flex-col gap-5">
            {templates.map((t) => (
              <TemplateEditor key={t.id} template={t} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
