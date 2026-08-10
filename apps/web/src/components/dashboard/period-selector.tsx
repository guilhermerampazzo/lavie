"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CalendarRange } from "lucide-react";

const PRESETS = [
  { value: "today", label: "Hoje" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Ano" },
] as const;

/**
 * Seletor de período: presets + calendário custom (from/to).
 * Usado na home e em qualquer tela com comparativo — monta a URL
 * com ?period= OU ?from=...&to=... preservando os demais params.
 */
export function PeriodSelector({
  current,
  basePath = "/",
  extraParams = {},
}: {
  current?: string;
  basePath?: string;
  extraParams?: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function buildUrl(params: Record<string, string>) {
    const qs = new URLSearchParams({ ...extraParams, ...params });
    const query = qs.toString();
    return `${pathname || basePath}${query ? `?${query}` : ""}`;
  }

  function applyPreset(value: string) {
    router.push(buildUrl({ period: value }));
  }

  function applyCustom() {
    if (!from || !to) return;
    router.push(buildUrl({ from, to }));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex overflow-hidden rounded-lg border border-line">
        {PRESETS.map((p) => (
          <a
            key={p.value}
            href={buildUrl({ period: p.value })}
            onClick={(e) => {
              e.preventDefault();
              applyPreset(p.value);
            }}
            className={`border-r border-line px-3 py-1.5 text-[11.5px] last:border-r-0 ${
              current === p.value ? "bg-brand-soft font-medium text-brand-dark" : "text-muted-foreground hover:text-brand-dark"
            }`}
          >
            {p.label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1">
        <CalendarRange className="size-3.5 text-brand-dark" strokeWidth={1.7} />
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="h-7 w-[118px] rounded-md border-0 bg-transparent text-[11.5px] outline-none focus:border-brand"
          title="Data inicial"
        />
        <span className="text-[11px] text-muted-foreground">até</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="h-7 w-[118px] rounded-md border-0 bg-transparent text-[11.5px] outline-none focus:border-brand"
          title="Data final"
        />
        <button
          type="button"
          onClick={applyCustom}
          className="ml-1 rounded-md bg-brand px-2.5 py-1 text-[11px] font-medium text-white hover:bg-brand-dark"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}
