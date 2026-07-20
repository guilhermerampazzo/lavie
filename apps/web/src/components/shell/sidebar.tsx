"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PAINEL_NAV } from "./nav-items";

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <aside className="hidden w-[220px] flex-col border-r border-line bg-canvas px-3.5 py-5 lg:flex">
      <Link href="/" className="mb-5 flex items-center gap-2.5 px-2 py-1">
        <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
        <span className="font-serif text-[15px] font-semibold text-ink">La Vie</span>
      </Link>

      <nav className="flex flex-col gap-0.5">
        {PAINEL_NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] text-muted-foreground transition-colors",
                active
                  ? "bg-brand-soft font-medium text-brand-dark"
                  : "hover:bg-brand-soft/60 hover:text-ink",
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.7} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-2 border-t border-line pt-3 text-[12.5px] text-muted-foreground">
        <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand-dark">
          {initials}
        </span>
        <span className="truncate">{userName}</span>
      </div>
    </aside>
  );
}
