import { Ticket } from "lucide-react";
import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { CouponForm } from "@/components/produtos/coupon-form";
import type { Coupon } from "@/types/product";

const TYPE_LABEL: Record<Coupon["type"], string> = {
  fixed: "Valor fixo",
  percentage: "Percentual",
  free_shipping: "Frete grátis",
};

export default async function CuponsPage() {
  const session = await auth();
  const coupons = await apiServerFetch<Coupon[]>("/coupons").catch(() => [] as Coupon[]);

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Cupons</h1>
            <p className="text-[12.5px] text-muted-foreground">
              {coupons.filter((c) => c.active).length} ativos de {coupons.length}
            </p>
          </div>
          <CouponForm />
        </div>

        {coupons.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="Nenhum cupom ativo"
            description="Crie um cupom de desconto ou frete grátis para começar a divulgar."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Código</th>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 text-right font-medium">Valor</th>
                  <th className="px-3 py-2 text-right font-medium">Usos</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-line/60 last:border-0">
                    <td className="px-3 py-2.5 font-medium">{c.code}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{TYPE_LABEL[c.type]}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {c.type === "percentage" ? `${c.value}%` : c.type === "fixed" ? `R$ ${c.value}` : "-"}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {c.usageCount}
                      {c.usageLimit ? `/${c.usageLimit}` : ""}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={
                          c.active
                            ? "inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success"
                            : "inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-medium text-danger"
                        }
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                        {c.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
