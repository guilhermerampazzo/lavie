import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

export function PortalShell({
  resellerName,
  children,
}: {
  resellerName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex h-14 items-center justify-between border-b border-line bg-surface px-5">
        <Link href="/portal" className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
          <span className="font-serif text-[15px] font-semibold text-ink">La Vie · Portal</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-[12px] text-muted-foreground sm:inline">{resellerName}</span>
          <Link href="/portal/pedidos" className="text-[12.5px] font-medium text-brand-dark">
            Meus pedidos
          </Link>
          <SignOutButton />
        </div>
      </header>
      <main className="px-5 py-6 lg:px-8">{children}</main>
    </div>
  );
}
