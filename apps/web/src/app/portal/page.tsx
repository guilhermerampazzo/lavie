import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function PortalHome() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-canvas px-6 text-center">
      <div className="flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-brand" aria-hidden="true" />
        <span className="font-serif text-lg font-semibold text-ink">La Vie</span>
      </div>
      <div>
        <h1 className="mb-1 font-serif text-2xl font-medium text-ink">
          Portal da revendedora
        </h1>
        <p className="text-sm text-muted-foreground">
          Olá, {session?.user?.name}. Catálogo e pedidos chegam na Fase 3.
        </p>
      </div>
      <SignOutButton />
    </div>
  );
}
