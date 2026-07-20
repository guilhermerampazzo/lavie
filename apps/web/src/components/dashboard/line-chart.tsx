"use client";

import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export function RevenueLineChart({ data }: { data: Array<{ day: string; total: number }> }) {
  const chartData = data.map((d) => ({
    ...d,
    label: new Date(d.day).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ left: -20, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} stroke="var(--line)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={60} />
        <Tooltip
          formatter={(value) => Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "var(--line)" }}
        />
        <Area type="monotone" dataKey="total" stroke="var(--brand)" fill="var(--brand-soft)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
