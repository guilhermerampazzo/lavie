import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-surface px-6 py-16 text-center",
        className,
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand-dark">
        <Icon className="size-5" strokeWidth={1.6} />
      </span>
      <div>
        <p className="font-serif text-[16px] font-medium text-ink">{title}</p>
        <p className="mt-1 max-w-xs text-[12.5px] text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
