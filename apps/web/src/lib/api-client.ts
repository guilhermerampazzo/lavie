import { auth } from "@/lib/auth";

const API_URL = process.env.API_INTERNAL_URL ?? "http://api:4000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Client para Server Components / Server Actions (roda no servidor Next.js). */
export async function apiServerFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = await auth();
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body || res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
