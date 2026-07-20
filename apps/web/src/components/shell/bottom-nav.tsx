"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BOTTOM_NAV } from "./nav-items";
import { Menu } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-[60px] items-center justify-around border-t border-line bg-surface lg:hidden">
      {BOTTOM_NAV.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 text-[9.5px] text-muted-foreground",
              active && "font-medium text-brand-dark",
            )}
          >
            <Icon className="size-[18px]" strokeWidth={1.7} />
            {item.label}
          </Link>
        );
      })}
      <button className="flex flex-col items-center gap-0.5 text-[9.5px] text-muted-foreground">
        <Menu className="size-[18px]" strokeWidth={1.7} />
        Mais
      </button>
    </nav>
  );
}
