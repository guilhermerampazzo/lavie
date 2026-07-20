import { EvolutionConfig } from './config';

/**
 * Client tipado para o Evolution API v2.3.7 (WhatsApp — Fase 4, CLAUDE.md secao 3).
 * Nasce agora com a estrutura basica; os fluxos de atendimento/automacao
 * so entram quando a Fase 4 comecar.
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
  };

  messages = {
    sendText: (instanceName: string, data: unknown) =>
      this.request(`/message/sendText/${instanceName}`, { method: 'POST', body: JSON.stringify(data) }),
  };
}
