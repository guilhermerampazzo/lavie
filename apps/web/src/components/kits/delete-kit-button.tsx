"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";

export function DeleteKitButton({ kitId }: { kitId: string }) {
  const router = useRouter();
  const apiFetch = useApiClient();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Excluir este kit?")) return;
    setLoading(true);
    try {
      await apiFetch(`/kits/${kitId}`, { method: "DELETE" });
      toast.success("Kit excluído.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível excluir.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleDelete}
      className="text-muted-foreground hover:text-danger disabled:opacity-50"
      title="Excluir kit"
    >
      <Trash2 className="size-3.5" />
    </button>
  );
}
