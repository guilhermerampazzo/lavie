import { Tag } from "lucide-react";
import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { NewKitSheet } from "@/components/kits/new-kit-sheet";
import { DeleteKitButton } from "@/components/kits/delete-kit-button";
import type { ResellerKit } from "@/types/kits";

export default async function KitsPage() {
  const session = await auth();
  const kits = await apiServerFetch<ResellerKit[]>("/kits").catch(() => [] as ResellerKit[]);

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Kits exclusivos</h1>
            <p className="text-[12.5px] text-muted-foreground">
              Combinações de peças com desconto para revendedoras (aparecem no catálogo do portal)
            </p>
          </div>
          <NewKitSheet />
        </div>

        {kits.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="Nenhum kit criado"
            description="Monte kits combinando produtos com desconto adicional para o catálogo de revendedoras."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {kits.map((kit) => (
              <div key={kit.id} className="rounded-xl border border-line bg-surface p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-ink">{kit.name}</span>
                    {Number(kit.discountPct) > 0 && (
                      <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[10.5px] font-medium text-success">
                        -{kit.discountPct}%
                      </span>
                    )}
                  </div>
                  <DeleteKitButton kitId={kit.id} />
                </div>
                {kit.description && <p className="mb-2 text-[11.5px] text-muted-foreground">{kit.description}</p>}
                <div className="flex flex-col gap-0.5 text-[11.5px] text-muted-foreground">
                  {kit.items.map((item) => (
                    <span key={item.id}>
                      {item.quantity}× {item.product?.nomeGerado ?? item.productId}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
