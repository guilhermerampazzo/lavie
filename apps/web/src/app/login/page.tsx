import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";
import { BrandLogo } from "@/components/brand-logo";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/");

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop / tablet: painel de marca + formulario */}
      <div className="mx-auto hidden min-h-screen max-w-6xl lg:grid lg:grid-cols-[1.05fr_1fr]">
        <BrandPanel />
        <div className="flex flex-col justify-center px-16 py-12">
          <FormHeading />
          <Suspense>
            <LoginForm variant="desktop" />
          </Suspense>
          <FormFooter />
        </div>
      </div>

      {/* Mobile: logo no topo, card de formulario abaixo */}
      <div className="flex min-h-screen flex-col px-5 py-8 lg:hidden">
        <div className="mb-8 mt-4 flex flex-col items-center gap-3">
          <BrandLogo height={26} />
          <span className="text-xs text-muted-foreground">Painel administrativo</span>
        </div>

        <div className="flex flex-1 flex-col rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-1 font-serif text-xl font-medium text-ink">Entrar</h2>
          <p className="mb-6 text-[13px] text-muted-foreground">
            Use suas credenciais da equipe.
          </p>
          <Suspense>
            <LoginForm variant="mobile" />
          </Suspense>
          <p className="mt-auto pt-6 text-center text-[11.5px] text-muted-foreground">
            Revendedora?{" "}
            <a href="#" className="font-medium text-brand-dark">
              Acesse o portal
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden border-r border-line bg-canvas px-12 py-12">
      <div className="flex items-center">
        <BrandLogo height={24} />
      </div>

      <div className="max-w-[360px]">
        <p className="mb-3.5 text-xs font-medium uppercase tracking-wider text-brand-dark">
          Painel administrativo
        </p>
        <h1 className="mb-4 text-balance font-serif text-[30px] font-medium leading-[1.28] text-ink">
          Cada peça carrega um processo. O painel existe para que ele nunca se
          perca.
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Produtos, pedidos, revendedoras e afiliadas — tudo o que sustenta a
          loja, num só lugar.
        </p>
      </div>

      <svg
        className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 opacity-50"
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        <g fill="none" stroke="#8e6f53" strokeWidth="0.7">
          <polygon points="100,10 180,60 180,140 100,190 20,140 20,60" />
          <polygon points="100,10 180,60 100,95" />
          <polygon points="180,60 180,140 100,95" />
          <polygon points="100,190 20,140 100,95" />
          <polygon points="20,140 20,60 100,95" />
        </g>
      </svg>

      <div className="flex items-center justify-between border-t border-line pt-[18px] text-xs text-muted-foreground">
        <span>usejoiaslavie.com.br</span>
        <span className="inline-flex items-center gap-1.5 font-medium text-brand-dark">
          Acesso restrito à equipe
        </span>
      </div>
    </div>
  );
}

function FormHeading() {
  return (
    <div className="mb-[30px]">
      <h2 className="mb-1.5 font-serif text-2xl font-medium text-ink">
        Entrar no painel
      </h2>
      <p className="text-[13.5px] text-muted-foreground">
        Use suas credenciais da equipe La Vie.
      </p>
    </div>
  );
}

function FormFooter() {
  return (
    <div className="mt-7 flex items-center justify-between border-t border-line pt-5 text-[12.5px] text-muted-foreground">
      <span>Revendedora?</span>
      <a href="#" className="text-ink">
        Acesse o portal de parceiras
      </a>
    </div>
  );
}
