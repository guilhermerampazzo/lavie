import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { FileText, Zap } from "lucide-react";
import { SyncPanel, type SyncJobItem } from "@/components/configuracoes/sync-panel";

interface IntegrationStatus {
  configured: boolean;
  label: string;
}

interface IntegrationsResponse {
  nuvemshop: IntegrationStatus;
  bling: IntegrationStatus;
  evolution: IntegrationStatus;
}

export default async function ConfiguracoesPage() {
  const session = await auth();
  const [integrations, syncJobs] = await Promise.all([
    apiServerFetch<IntegrationsResponse>("/settings/integrations").catch(() => null),
    apiServerFetch<SyncJobItem[]>("/settings/sync-jobs").catch(() => [] as SyncJobItem[]),
  ]);

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5">
          <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Configurações</h1>
          <p className="text-[12.5px] text-muted-foreground">
            Integrações, templates e dados da marca
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-line bg-surface p-5">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Integrações
            </p>
            {integrations ? (
              <div className="flex flex-col">
                {(["nuvemshop", "bling", "evolution"] as const).map((key) => {
                  const item = integrations[key];
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between border-b border-line/60 py-2.5 text-[12.5px] last:border-0"
                    >
                      <span>{item.label}</span>
                      <span
                        className={
                          item.configured
                            ? "inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success"
                            : "inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning"
                        }
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                        {item.configured ? "Conectado" : "Não configurado"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[12.5px] text-muted-foreground">Não foi possível carregar as integrações.</p>
            )}
            <p className="mt-3 text-[11px] text-muted-foreground">
              Credenciais são definidas por variáveis de ambiente (.env) — não editáveis por aqui por segurança.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Atalhos
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/produtos/templates"
                className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 text-[12.5px] hover:bg-brand-soft/40"
              >
                <FileText className="size-4 text-brand-dark" strokeWidth={1.7} />
                Templates de produto
              </Link>
              <Link
                href="/fluxos"
                className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 text-[12.5px] hover:bg-brand-soft/40"
              >
                <Zap className="size-4 text-brand-dark" strokeWidth={1.7} />
                Fluxos automáticos (WhatsApp)
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2">
            <SyncPanel jobs={syncJobs} disabled={!integrations?.nuvemshop.configured} />
          </div>

          <div className="rounded-xl border border-line bg-surface p-5 lg:col-span-2">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Marca
            </p>
            <div className="flex items-center gap-4">
              <Image
                src="/logo.webp"
                alt="Logo La Vie"
                width={56}
                height={56}
                className="rounded-lg border border-line object-contain p-1.5"
              />
              <div>
                <p className="text-[12.5px] font-medium text-ink">La Vie — Joias e Semijoias</p>
                <p className="text-[11px] text-muted-foreground">
                  Cor da marca <span className="font-mono">#8e6f53</span> · usejoiaslavie.com.br
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
