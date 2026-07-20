import { auth } from "@/lib/auth";
import { AppShell } from "@/components/shell/app-shell";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador(a)",
  equipe: "Equipe",
  revendedora: "Revendedora",
};

export default async function Home() {
  const session = await auth();

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <div className="px-5 py-6 lg:px-6">
        <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">
          Bem-vinda(o), {session?.user?.name}
        </h1>
        <p className="text-[12.5px] text-muted-foreground">
          {session?.user?.role ? ROLE_LABEL[session.user.role] : ""} · dashboard executivo chega na Fase 3.
        </p>
      </div>
    </AppShell>
  );
}
