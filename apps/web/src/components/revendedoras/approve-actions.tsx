"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";

export function ApproveActions({ resellerId }: { resellerId: string }) {
  const apiFetch = useApiClient();
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "block" | null>(null);

  async function act(action: "approve" | "block") {
    setLoading(action);
    try {
      await apiFetch(`/resellers/${resellerId}/${action}`, { method: "POST" });
      toast.success(action === "approve" ? "Revendedora aprovada." : "Cadastro recusado.");
      router.refresh();
    } catch {
      toast.error("Não foi possível concluir a ação.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-1.5">
      <Button
        type="button"
        variant="outline"
        className="h-[30px] rounded-md border-line px-3 text-[11.5px]"
        disabled={loading !== null}
        onClick={() => act("block")}
      >
        Recusar
      </Button>
      <Button
        type="button"
        className="h-[30px] rounded-md bg-success px-3 text-[11.5px] text-white hover:bg-success/90"
        disabled={loading !== null}
        onClick={() => act("approve")}
      >
        {loading === "approve" ? "Aprovando…" : "Aprovar"}
      </Button>
    </div>
  );
}
