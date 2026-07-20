import { cn } from "@/lib/utils";
import type { CustomerSegment } from "@/types/people";

const SEGMENT_MAP: Record<CustomerSegment, { label: string; cls: string }> = {
  vip: { label: "VIP", cls: "bg-brand-soft text-brand-dark" },
  fiel: { label: "Fiel", cls: "bg-success/10 text-success" },
  novo: { label: "Novo", cls: "bg-[#e6f0f5] text-[#2b5f7a]" },
  a_reativar: { label: "A reativar", cls: "bg-warning/10 text-warning" },
  aniversariante: { label: "Aniversariante", cls: "bg-[#f5e6ef] text-[#9b3b6c]" },
  carrinho_abandonado: { label: "Carrinho abandonado", cls: "bg-danger/10 text-danger" },
};

export function SegmentBadge({ segment }: { segment: CustomerSegment }) {
  const { label, cls } = SEGMENT_MAP[segment];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-medium", cls)}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
