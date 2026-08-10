"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";

export function PublishButton({ productId }: { productId: string }) {
  const router = useRouter();
  const apiFetch = useApiClient();
  const [loading, setLoading] = useState(false);

  async function handlePublish() {
    setLoading(true);
    try {
      await apiFetch(`/products/${productId}/publish`, { method: "POST" });
      toast.success("Produto publicado na Nuvemshop.");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível publicar. Verifique a integração com a Nuvemshop.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      className="rounded-btn bg-brand text-white hover:bg-brand-dark"
      disabled={loading}
      onClick={handlePublish}
    >
      {loading ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Send className="mr-1.5 size-3.5" />}
      Publicar na Nuvemshop
    </Button>
  );
}
