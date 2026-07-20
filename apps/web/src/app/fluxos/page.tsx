import { Zap } from "lucide-react";
import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { FlowToggle } from "@/components/atendimento/flow-toggle";
import { FlowForm } from "@/components/atendimento/flow-form";
import type { MessageTemplateItem } from "@/types/atendimento";

export default async function FluxosPage() {
  const session = await auth();
  const flows = await apiServerFetch<MessageTemplateItem[]>("/message-templates").catch(
    () => [] as MessageTemplateItem[],
  );

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Fluxos automáticos</h1>
            <p className="text-[12.5px] text-muted-foreground">Mensagens disparadas automaticamente pelo WhatsApp</p>
          </div>
          <FlowForm />
        </div>

        {flows.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="Nenhum fluxo cadastrado"
            description="Crie fluxos como boas-vindas, confirmação de pedido ou aniversário."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {flows.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-xl border border-line bg-surface p-3.5">
                <div>
                  <p className="text-[13px] font-medium text-ink">{f.name}</p>
                  <p className="text-[11px] text-muted-foreground">Gatilho: {f.trigger}</p>
                </div>
                <FlowToggle id={f.id} active={f.active} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
