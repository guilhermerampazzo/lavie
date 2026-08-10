"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";

/** Aprova produto em revisão (em_revisao -> active). */
export function ApproveButton({ productId }: { productId: string }) {
  const router = useRouter();
  const apiFetch = useApiClient();
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    try {
      await apiFetch(`/products/${productId}/approve`, { method: "POST" });
      toast.success("Produto aprovado.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível aprovar o produto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      className="rounded-btn border-success/40 text-success hover:bg-success/5"
      disabled={loading}
      onClick={handleApprove}
    >
      {loading ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Check className="mr-1.5 size-3.5" />}
      Aprovar
    </Button>
  );
}
