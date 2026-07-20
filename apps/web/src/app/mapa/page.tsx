import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { ResellersMap } from "@/components/mapa/resellers-map";
import { EmptyState } from "@/components/ui/empty-state";
import { MapPin } from "lucide-react";
import type { Reseller } from "@/types/people";

export default async function MapaPage() {
  const session = await auth();
  const resellers = await apiServerFetch<Reseller[]>("/resellers").catch(() => [] as Reseller[]);
  const withCoords = resellers.filter((r) => r.lat != null && r.lng != null);

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5">
          <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Mapa de revendedoras</h1>
          <p className="text-[12.5px] text-muted-foreground">
            {withCoords.length} de {resellers.length} revendedoras com localização cadastrada
          </p>
        </div>

        {withCoords.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="Nenhuma localização cadastrada"
            description="Adicione latitude e longitude às revendedoras para vê-las aqui."
          />
        ) : (
          <ResellersMap
            resellers={withCoords.map((r) => ({
              id: r.id,
              name: r.name,
              city: r.city,
              state: r.state,
              lat: r.lat as number,
              lng: r.lng as number,
            }))}
          />
        )}
      </div>
    </AppShell>
  );
}
