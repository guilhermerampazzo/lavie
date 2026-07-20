"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BOTTOM_NAV, PAINEL_NAV } from "./nav-items";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const bottomHrefs = new Set(BOTTOM_NAV.map((i) => i.href));
  const moreItems = PAINEL_NAV.filter((i) => !bottomHrefs.has(i.href));
  const moreActive = moreItems.some((i) => i.href === pathname);

  return (
    <>
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
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "flex flex-col items-center gap-0.5 text-[9.5px] text-muted-foreground",
            moreActive && "font-medium text-brand-dark",
          )}
        >
          <Menu className="size-[18px]" strokeWidth={1.7} />
          Mais
        </button>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-6">
          <SheetHeader>
            <SheetTitle className="font-serif text-[16px]">Mais opções</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-1 px-4">
            {moreItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg py-3 text-[11px] text-muted-foreground",
                    active && "bg-brand-soft font-medium text-brand-dark",
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.6} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
