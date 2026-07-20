import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  novo: { label: "Novo", cls: "bg-[#e6f0f5] text-[#2b5f7a]" },
  pago: { label: "Pago", cls: "bg-success/10 text-success" },
  em_separacao: { label: "Em separação", cls: "bg-warning/10 text-warning" },
  embalado: { label: "Embalado", cls: "bg-warning/10 text-warning" },
  enviado: { label: "Enviado", cls: "bg-brand-soft text-brand-dark" },
  entregue: { label: "Entregue", cls: "bg-success/10 text-success" },
  cancelado: { label: "Cancelado", cls: "bg-danger/10 text-danger" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const { label, cls } = STATUS_MAP[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-medium", cls)}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
