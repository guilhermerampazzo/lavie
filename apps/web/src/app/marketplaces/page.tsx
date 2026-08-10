import { Store, CheckCircle2, CircleDashed, TriangleAlert } from "lucide-react";
import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import type { ChannelStatusEntry } from "@/types/channels";

const CHANNEL_ICONS: Record<string, string> = {
  nuvemshop: "Site / Nuvemshop",
  instagram: "Instagram Shop",
  tiktok: "TikTok Shop",
  mercado_livre: "Mercado Livre",
  shopee: "Shopee",
  amazon: "Amazon Brasil",
  shein: "Shein",
  revendedora: "Portal Revendedoras",
  fisico: "Físico / PDV",
};

export default async function MarketplacesPage() {
  const session = await auth();
  const channels = await apiServerFetch<ChannelStatusEntry[]>("/channels").catch(
    () => [] as ChannelStatusEntry[],
  );

  const configured = channels.filter((c) => c.configured);
  const pending = channels.filter((c) => !c.configured);

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5">
          <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Canais e marketplaces</h1>
          <p className="text-[12.5px] text-muted-foreground">
            Status de cada canal de venda — credenciais configuradas em{" "}
            <a href="/configuracoes" className="underline hover:text-brand-dark">Configurações</a>
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
          <div className="rounded-xl border border-line p-4">
            <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">Canais ativos</p>
            <p className="font-serif text-[24px] font-medium text-success">{configured.length}</p>
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">Aguardando credenciais</p>
            <p className="font-serif text-[24px] font-medium text-warning">{pending.length}</p>
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">Total de canais</p>
            <p className="font-serif text-[24px] font-medium text-ink">{channels.length}</p>
          </div>
        </div>

        {channels.length === 0 ? (
          <EmptyState
            icon={Store}
            title="Nenhum canal disponível"
            description="Os canais de venda aparecem aqui conforme forem configurados."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((ch) => (
              <div key={ch.key} className="rounded-xl border border-line bg-surface p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-ink">
                    {CHANNEL_ICONS[ch.key] ?? ch.key}
                  </span>
                  {ch.configured ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10.5px] font-medium text-success">
                      <CheckCircle2 className="size-3" /> Conectado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[10.5px] font-medium text-warning">
                      <CircleDashed className="size-3" /> Sem credenciais
                    </span>
                  )}
                </div>

                {ch.configured ? (
                  <p className="text-[11.5px] text-muted-foreground">
                    Pronto para publicação. Selecione este canal no cadastro do produto para publicar.
                  </p>
                ) : (
                  <div>
                    <p className="mb-2 text-[11.5px] text-muted-foreground">
                      {ch.key === "nuvemshop"
                        ? "Definido por variável de ambiente (NUVEMSHOP_*)."
                        : "Preencha as credenciais em Configurações para ativar."}
                    </p>
                    {ch.credentialFields && ch.credentialFields.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {ch.credentialFields
                          .filter((f: { hasValue?: boolean }) => f.hasValue)
                          .map((f: { key: string; label: string }) => (
                            <span key={f.key} className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[10px] text-brand-dark">
                              {f.label} ✓
                            </span>
                          ))}
                        {!ch.credentialFields.some((f: { hasValue?: boolean }) => f.hasValue) && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            <TriangleAlert className="size-2.5" /> Nada preenchido
                          </span>
                        )}
                      </div>
                    ) : (
                      <a
                        href="/configuracoes"
                        className="text-[11px] font-medium text-brand-dark underline hover:text-brand"
                      >
                        Configurar agora →
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="mt-5 text-[11px] text-muted-foreground">
          A sincronização real de catálogo/pedidos de cada marketplace é ativada quando as credenciais da plataforma
          forem fornecidas. Estrutura de adapters já pronta.
        </p>
      </div>
    </AppShell>
  );
}
