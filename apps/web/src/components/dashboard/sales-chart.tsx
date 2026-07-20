"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export function SalesChart({ data }: { data: Array<{ channel: string; total: number }> }) {
  const CHANNEL_LABEL: Record<string, string> = {
    site: "Site",
    revendedora: "Revendedoras",
    marketplace: "Marketplace",
    fisico: "Físico",
  };

  const chartData = data.map((d) => ({ ...d, label: CHANNEL_LABEL[d.channel] ?? d.channel }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} stroke="var(--line)" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={90}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "var(--line)" }}
        />
        <Bar dataKey="total" fill="var(--brand)" radius={4} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}
