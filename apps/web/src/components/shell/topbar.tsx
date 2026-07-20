import { Search } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";

export function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-line px-5">
      <div className="flex h-8 w-full max-w-[320px] items-center gap-2 rounded-lg border border-line px-2.5 text-[12.5px] text-muted-foreground">
        <Search className="size-3.5" strokeWidth={2} />
        Buscar produto, SKU...
      </div>
      <SignOutButton />
    </header>
  );
}
