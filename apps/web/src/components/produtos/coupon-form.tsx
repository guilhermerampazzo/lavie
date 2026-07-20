"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const emptyToUndefined = (v: unknown) => (v === "" || v === undefined ? undefined : v);

const couponSchema = z.object({
  code: z.string().min(1, "Informe o código"),
  type: z.enum(["fixed", "percentage", "free_shipping"]),
  value: z.preprocess(emptyToUndefined, z.coerce.number().positive().optional()),
  usageLimit: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
});

type CouponFormValues = z.infer<typeof couponSchema>;

export function CouponForm() {
  const router = useRouter();
  const apiFetch = useApiClient();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: { type: "percentage" } as CouponFormValues,
  });

  const type = watch("type");

  async function onSubmit(values: CouponFormValues) {
    setSubmitting(true);
    try {
      await apiFetch("/coupons", {
        method: "POST",
        body: JSON.stringify({
          code: values.code.toUpperCase(),
          type: values.type,
          value: values.type === "free_shipping" ? undefined : values.value,
          usageLimit: values.usageLimit,
        }),
      });
      toast.success("Cupom criado.");
      reset();
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Não foi possível criar o cupom.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="rounded-btn bg-brand text-white hover:bg-brand-dark"
      >
        Novo cupom
      </Button>
    );
  }

  return (
    <div className="mb-5 grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-4 sm:items-end">
      <div>
        <Label className="mb-1.5 block text-xs font-medium">Código</Label>
        <Input className="h-9 rounded-[9px] border-line text-[12.5px] uppercase" placeholder="LAVIE10" {...register("code")} />
        {errors.code && <p className="mt-1 text-xs text-danger">{errors.code.message}</p>}
      </div>
      <div>
        <Label className="mb-1.5 block text-xs font-medium">Tipo</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="h-9 rounded-[9px] border-line text-[12.5px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentual</SelectItem>
                <SelectItem value="fixed">Valor fixo</SelectItem>
                <SelectItem value="free_shipping">Frete grátis</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
      {type !== "free_shipping" && (
        <div>
          <Label className="mb-1.5 block text-xs font-medium">Valor</Label>
          <Input
            className="h-9 rounded-[9px] border-line text-[12.5px]"
            type="number"
            step="0.01"
            {...register("value")}
          />
          {errors.value && <p className="mt-1 text-xs text-danger">{errors.value.message}</p>}
        </div>
      )}
      <div>
        <Label className="mb-1.5 block text-xs font-medium">Limite de uso</Label>
        <Input className="h-9 rounded-[9px] border-line text-[12.5px]" type="number" {...register("usageLimit")} />
        {errors.usageLimit && <p className="mt-1 text-xs text-danger">{errors.usageLimit.message}</p>}
      </div>
      <div className="flex gap-2 sm:col-span-4">
        <Button
          type="button"
          disabled={submitting}
          onClick={handleSubmit(onSubmit)}
          className="rounded-btn bg-brand text-white hover:bg-brand-dark"
        >
          {submitting ? "Criando…" : "Criar cupom"}
        </Button>
        <Button type="button" variant="outline" className="rounded-btn border-line" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
