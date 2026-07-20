"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";
import { cn } from "@/lib/utils";

export function FlowToggle({ id, active }: { id: string; active: boolean }) {
  const apiFetch = useApiClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      await apiFetch(`/message-templates/${id}`, {
        method: "PUT",
        body: JSON.stringify({ active: !active }),
      });
      router.refresh();
    } catch {
      toast.error("Não foi possível atualizar o fluxo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={toggle}
      aria-pressed={active}
      className={cn(
        "relative h-[19px] w-[34px] rounded-full transition-colors disabled:opacity-60",
        active ? "bg-brand" : "bg-line",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-[15px] rounded-full bg-white shadow transition-all",
          active ? "right-0.5" : "left-0.5",
        )}
      />
    </button>
  );
}
