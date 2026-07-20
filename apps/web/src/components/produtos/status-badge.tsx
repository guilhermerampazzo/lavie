import { cn } from "@/lib/utils";

const STATUS_MAP = {
  active: { label: "Ativo", cls: "bg-success/10 text-success" },
  draft: { label: "Rascunho", cls: "bg-warning/10 text-warning" },
  inactive: { label: "Inativo", cls: "bg-danger/10 text-danger" },
} as const;

export function StatusBadge({ status }: { status: keyof typeof STATUS_MAP }) {
  const { label, cls } = STATUS_MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        cls,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
