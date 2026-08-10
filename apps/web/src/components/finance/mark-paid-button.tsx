"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";

export function MarkPaidButton({ accountId }: { accountId: string }) {
  const router = useRouter();
  const apiFetch = useApiClient();
  const [loading, setLoading] = useState(false);

  async function handlePaid() {
    setLoading(true);
    try {
      await apiFetch(`/finance/accounts/${accountId}/paid`, { method: "POST" });
      toast.success("Conta marcada como paga.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível atualizar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      className="h-7 rounded-btn border-success/40 px-2 text-[11px] text-success hover:bg-success/5"
      disabled={loading}
      onClick={handlePaid}
    >
      {loading ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Check className="mr-1 size-3" />}
      Marcar paga
    </Button>
  );
}
