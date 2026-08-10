"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRESETS = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "12m", label: "12 meses" },
];

/**
 * Seletor de período para relatórios + comparação com o período anterior.
 * Monta a URL /relatorios?tab=X&from=...&to=...&compareFrom=...&compareTo=...
 */
export function PeriodCompareSelector({
  tab,
  from,
  to,
  compareFrom,
}: {
  tab: string;
  from?: string;
  to?: string;
  compareFrom?: string;
  compareTo?: string;
}) {
  const router = useRouter();
  const [customFrom, setCustomFrom] = useState(from?.slice(0, 10) ?? "");
  const [customTo, setCustomTo] = useState(to?.slice(0, 10) ?? "");
  const [compare, setCompare] = useState(Boolean(compareFrom));

  function applyPreset(preset: string) {
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    let from: string;
    if (preset === "7d") {
      from = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
    } else if (preset === "30d") {
      from = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);
    } else if (preset === "90d") {
      from = new Date(now.getTime() - 90 * 86400000).toISOString().slice(0, 10);
    } else {
      from = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString().slice(0, 10);
    }
    const qs = new URLSearchParams({ tab, from, to });
    router.push(`/relatorios?${qs.toString()}`);
  }

  function applyCustom() {
    if (!customFrom || !customTo) return;
    const params = new URLSearchParams({ tab, from: customFrom, to: customTo });
    if (compare && customFrom && customTo) {
      const fromMs = new Date(customFrom).getTime();
      const toMs = new Date(customTo).getTime();
      const duration = toMs - fromMs;
      const compareTo = new Date(fromMs - 1).toISOString().slice(0, 10);
      const compareFromDate = new Date(fromMs - duration - 1).toISOString().slice(0, 10);
      params.set("compareFrom", compareFromDate);
      params.set("compareTo", compareTo);
    }
    router.push(`/relatorios?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface p-3">
      <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <CalendarRange className="size-3.5" /> Período e comparação
      </p>
      <div className="flex overflow-hidden rounded-lg border border-line">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => applyPreset(p.value)}
            className="px-2.5 py-1.5 text-[11.5px] font-medium text-muted-foreground hover:bg-brand-soft/40 hover:text-brand-dark"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={customFrom}
          onChange={(e) => setCustomFrom(e.target.value)}
          className="h-8 rounded-lg border border-line bg-surface px-2 text-[11.5px] outline-none focus:border-brand"
        />
        <span className="text-[11px] text-muted-foreground">até</span>
        <input
          type="date"
          value={customTo}
          onChange={(e) => setCustomTo(e.target.value)}
          className="h-8 rounded-lg border border-line bg-surface px-2 text-[11.5px] outline-none focus:border-brand"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-1.5 text-[11.5px] text-muted-foreground">
        <input
          type="checkbox"
          checked={compare}
          onChange={(e) => setCompare(e.target.checked)}
          className="size-3.5 accent-[#8e6f53]"
        />
        <GitCompareArrows className="size-3.5" />
        Comparar com período anterior
      </label>

      <Button
        type="button"
        className="h-8 rounded-btn bg-brand px-3 text-[11.5px] font-medium text-white hover:bg-brand-dark"
        onClick={applyCustom}
      >
        Aplicar
      </Button>
    </div>
  );
}
