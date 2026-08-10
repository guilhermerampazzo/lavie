"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

const EXPORTS: Record<string, { path: string; filename: string; label: string }> = {
  vendas: { path: "/reports/sales/export", filename: "relatorio-vendas.csv", label: "Vendas (CSV/Excel)" },
  afiliadas: { path: "/reports/affiliates/export", filename: "relatorio-afiliadas.csv", label: "Afiliadas (CSV/Excel)" },
  financeiro: { path: "/reports/financial/export", filename: "relatorio-financeiro.csv", label: "Financeiro (CSV/Excel)" },
};

export function ExportButton({ tab = "vendas" }: { tab?: string }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const config = EXPORTS[tab] ?? EXPORTS.vendas;

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch(`/api${config.path}`, {
        headers: session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = config.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exportação iniciada.");
    } catch {
      toast.error("Não foi possível exportar o relatório.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      className="rounded-btn border-line"
      disabled={loading}
      onClick={handleExport}
    >
      {loading ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Download className="mr-1.5 size-3.5" />}
      {config.label}
    </Button>
  );
}
