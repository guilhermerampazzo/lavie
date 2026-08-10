"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api-client-browser";
import type { ChannelCredentialsStatusMap } from "@/types/credentials";

/** Painel de credenciais por canal — Correios, Melhor Envio e marketplaces. */
export function CredentialsPanel({
  status,
}: {
  status: ChannelCredentialsStatusMap;
}) {
  const router = useRouter();
  const apiFetch = useApiClient();
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  async function handleSave(channel: string) {
    const payload = (values[channel] ?? {}) as Record<string, string>;
    const filled = Object.entries(payload).filter(([, v]) => v.trim());
    if (filled.length === 0) {
      toast.error("Preencha ao menos um campo para salvar.");
      return;
    }
    setSaving(channel);
    try {
      await apiFetch(`/settings/credentials/${channel}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast.success("Credenciais salvas.");
      setValues((prev) => ({ ...prev, [channel]: {} }));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(null);
    }
  }

  async function handleRemove(channel: string) {
    if (!confirm("Remover as credenciais deste canal?")) return;
    try {
      await apiFetch(`/settings/credentials/${channel}`, { method: "DELETE" });
      toast.success("Credenciais removidas.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível remover.");
    }
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {Object.entries(status).map(([channel, info]) => (
        <div key={channel} className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="size-3.5 text-brand-dark" strokeWidth={1.8} />
              <span className="text-[12.5px] font-medium text-ink">{info.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium ${
                  info.configured
                    ? "bg-success/10 text-success"
                    : info.hasCredentials
                      ? "bg-warning/10 text-warning"
                      : "bg-canvas text-muted-foreground"
                }`}
              >
                {info.configured ? "Configurado" : info.hasCredentials ? "Parcial" : "Vazio"}
              </span>
              {info.hasCredentials && (
                <button
                  type="button"
                  onClick={() => handleRemove(channel)}
                  className="text-muted-foreground hover:text-danger"
                  title="Remover credenciais"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {info.fields.map((field) => {
              const isSecret = field.secret;
              const show = revealed[`${channel}:${field.key}`];
              return (
                <div key={field.key}>
                  <label className="mb-1 block text-[10.5px] font-medium text-muted-foreground">
                    {field.label}
                    {field.hasValue && (
                      <span className="ml-1 rounded-full bg-success/10 px-1.5 py-0.5 text-[9px] text-success">
                        salvo
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type={isSecret && !show ? "password" : "text"}
                      value={values[channel]?.[field.key] ?? ""}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          [channel]: { ...prev[channel], [field.key]: e.target.value },
                        }))
                      }
                      placeholder={field.hasValue ? "•••••••• (manter atual)" : field.label}
                      className="h-8 w-full rounded-[9px] border border-line bg-surface px-2.5 text-[12px] outline-none focus:border-brand"
                      autoComplete="off"
                    />
                    {isSecret && (
                      <button
                        type="button"
                        onClick={() =>
                          setRevealed((prev) => ({ ...prev, [`${channel}:${field.key}`]: !prev[`${channel}:${field.key}`] }))
                        }
                        className="shrink-0 text-muted-foreground hover:text-brand-dark"
                        title={show ? "Ocultar" : "Mostrar"}
                      >
                        {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            disabled={saving === channel}
            onClick={() => handleSave(channel)}
            className="mt-4 flex h-9 w-full items-center justify-center gap-1.5 rounded-btn bg-brand px-4 text-[12px] font-medium text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {saving === channel ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            Salvar credenciais
          </button>
        </div>
      ))}
    </div>
  );
}
