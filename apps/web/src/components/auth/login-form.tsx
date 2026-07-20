"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe sua senha"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    const result = await signIn("credentials", {
      ...values,
      redirect: false,
    });

    if (result?.error) {
      setServerError("E-mail ou senha incorretos.");
      return;
    }

    router.push(searchParams.get("callbackUrl") ?? "/");
    router.refresh();
  };

  const emailId = variant === "desktop" ? "email-d" : "email-m";
  const passwordId = variant === "desktop" ? "senha-d" : "senha-m";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="mb-[18px]">
        <Label htmlFor={emailId} className="mb-[7px] block text-[12.5px] font-medium">
          E-mail
        </Label>
        <Input
          id={emailId}
          type="email"
          autoComplete="email"
          placeholder="nome@usejoiaslavie.com.br"
          className="h-10 rounded-[10px] border-line text-sm"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-danger">{errors.email.message}</p>
        )}
      </div>

      <div className="mb-[18px]">
        <Label htmlFor={passwordId} className="mb-[7px] block text-[12.5px] font-medium">
          Senha
        </Label>
        <Input
          id={passwordId}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••••"
          className="h-10 rounded-[10px] border-line text-sm"
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1.5 text-xs text-danger">{errors.password.message}</p>
        )}
      </div>

      {serverError && (
        <p className="-mt-2 mb-[18px] text-xs text-danger">{serverError}</p>
      )}

      <div className="row-between mb-[22px] mt-[-4px] flex items-center justify-between">
        <label className="flex items-center gap-[7px] text-[13px] text-muted-foreground">
          <input type="checkbox" className="h-3.5 w-3.5 accent-brand" />
          Manter conectado
        </label>
        <a href="#" className="text-[13px] font-medium text-brand-dark">
          Esqueci a senha
        </a>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "h-[42px] w-full rounded-btn bg-brand text-sm font-medium text-white hover:bg-brand-dark",
        )}
      >
        {isSubmitting ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
