import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { PortalShell } from "@/components/portal/portal-shell";
import { PortalCatalog } from "@/components/portal/catalog";
import type { PortalCatalogItem } from "@/types/portal";

export default async function PortalHome() {
  const session = await auth();
  const items = await apiServerFetch<PortalCatalogItem[]>("/portal/catalog").catch(
    () => [] as PortalCatalogItem[],
  );

  return (
    <PortalShell resellerName={session?.user?.name ?? ""}>
      {items.length === 0 ? (
        <p className="text-[12.5px] text-muted-foreground">
          Nenhum produto disponível no catálogo no momento.
        </p>
      ) : (
        <PortalCatalog items={items} />
      )}
    </PortalShell>
  );
}
