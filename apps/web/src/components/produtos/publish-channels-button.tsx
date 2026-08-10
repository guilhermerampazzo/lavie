"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";
import { Button } from "@/components/ui/button";

export interface ChannelPublishResult {
  channel: string;
  label: string;
  status: "published" | "pending" | "failed";
  message?: string;
}

/** Publica o produto nos canais selecionados (Nuvemshop real; marketplaces registrados). */
export function PublishChannelsButton({ productId }: { productId: string }) {
  const router = useRouter();
  const apiFetch = useApiClient();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ChannelPublishResult[] | null>(null);

  async function handlePublish() {
    setLoading(true);
    setResults(null);
    try {
      const data = await apiFetch<ChannelPublishResult[]>(`/channels/products/${productId}/publish`, {
        method: "POST",
      });
      setResults(data);
      const ok = data.filter((r) => r.status === "published").length;
      toast.success(`Publicação concluída: ${ok}/${data.length} canal(is).`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível publicar nos canais.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        variant="outline"
        className="rounded-btn border-line"
        disabled={loading}
        onClick={handlePublish}
      >
        {loading ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Share2 className="mr-1.5 size-3.5" />}
        Publicar nos canais
      </Button>

      {results && results.length > 0 && (
        <div className="mt-2 rounded-lg border border-line bg-canvas p-2.5">
          {results.map((r) => (
            <div key={r.channel} className="flex items-start gap-2 py-0.5 text-[11px]">
              <span
                className={`mt-1 size-1.5 shrink-0 rounded-full ${
                  r.status === "published" ? "bg-success" : r.status === "pending" ? "bg-warning" : "bg-danger"
                }`}
              />
              <div>
                <span className="font-medium text-ink">{r.label}</span>
                {r.message && <span className="ml-1 text-muted-foreground">{r.message}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
