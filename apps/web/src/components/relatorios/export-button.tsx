"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportButton() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch("/api/reports/sales/export", {
        headers: session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {},
      });
      if (!res.ok) throw new Error("export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio-vendas.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Não foi possível exportar o relatório.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="outline" className="rounded-btn border-line" disabled={loading} onClick={handleExport}>
      <Download className="mr-1.5 size-3.5" />
      {loading ? "Exportando…" : "Exportar CSV"}
    </Button>
  );
}
