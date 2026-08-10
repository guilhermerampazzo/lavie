import { EvolutionConfig } from './config';

/**
 * Client tipado para o Evolution API v2.3.7 (WhatsApp — Fase 4).
 * Endpoints validados em produção (2026-08): connectionState, fetchInstances,
 * setWebhook, findChats, message.sendText.
 */
export class EvolutionClient {
  constructor(private readonly config: EvolutionConfig) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.config.url}${path}`, {
      ...init,
      headers: {
        apikey: this.config.apiKey,
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`Evolution API error ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<T>;
  }

  instances = {
    status: (instanceName: string) => this.request(`/instance/connectionState/${instanceName}`),
    create: (data: unknown) => this.request('/instance/create', { method: 'POST', body: JSON.stringify(data) }),
    fetchAll: () => this.request('/instance/fetchInstances'),
    connect: (instanceName: string) => this.request(`/instance/connect/${instanceName}`, { method: 'POST' }),
    logout: (instanceName: string) => this.request(`/instance/logout/${instanceName}`, { method: 'POST' }),
    setWebhook: (instanceName: string, data: unknown) =>
      this.request(`/webhook/set/${instanceName}`, { method: 'POST', body: JSON.stringify(data) }),
    findWebhooks: (instanceName: string) => this.request(`/webhook/find/${instanceName}`),
  };

  messages = {
    sendText: (instanceName: string, data: unknown) =>
      this.request(`/message/sendText/${instanceName}`, { method: 'POST', body: JSON.stringify(data) }),
  };

  chats = {
    /** POST — validado na v2.3.7 em produção (2026-08): findChats é POST com body. */
    find: (instanceName: string, params: Record<string, unknown> = {}) =>
      this.request(`/chat/findChats/${instanceName}`, {
        method: 'POST',
        body: JSON.stringify({ where: {}, limit: 25, ...params }),
      }),
  };
}
