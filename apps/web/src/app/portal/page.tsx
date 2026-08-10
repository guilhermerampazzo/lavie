import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { PortalShell } from "@/components/portal/portal-shell";
import { PortalCatalog as PortalCatalogView } from "@/components/portal/catalog";
import type { PortalCatalog } from "@/types/portal";

export default async function PortalHome() {
  const session = await auth();
  const catalog = await apiServerFetch<PortalCatalog>("/portal/catalog").catch(
    () => ({ items: [], minQuantity: 1, kits: [] }) as PortalCatalog,
  );

  return (
    <PortalShell resellerName={session?.user?.name ?? ""}>
      {catalog.items.length === 0 ? (
        <p className="text-[12.5px] text-muted-foreground">
          Nenhum produto disponível no catálogo no momento.
        </p>
      ) : (
        <PortalCatalogView data={catalog} />
      )}
    </PortalShell>
  );
}
