import { cn } from "@/lib/utils";

const STATUS_MAP = {
  aberta: { label: "Aberta", cls: "bg-warning/10 text-warning" },
  paga: { label: "Paga", cls: "bg-success/10 text-success" },
  atrasada: { label: "Atrasada", cls: "bg-danger/10 text-danger" },
} as const;

export function AccountStatusBadge({ status }: { status: keyof typeof STATUS_MAP }) {
  const { label, cls } = STATUS_MAP[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium", cls)}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
