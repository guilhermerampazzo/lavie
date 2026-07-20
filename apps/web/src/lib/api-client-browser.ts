"use client";

import { useSession } from "next-auth/react";
import { useCallback } from "react";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Client para Client Components — chama /api/* no mesmo host (Caddy roteia para a API). */
export function useApiClient() {
  const { data: session } = useSession();

  return useCallback(
    async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
      const res = await fetch(`/api${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
          ...init.headers,
        },
      });

      if (!res.ok) {
        const body = await res.text();
        throw new ApiError(res.status, body || res.statusText);
      }

      if (res.status === 204) return undefined as T;
      return res.json() as Promise<T>;
    },
    [session?.accessToken],
  );
}
