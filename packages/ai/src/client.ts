import { AiConfig } from './config';

export type ChatMessage =
  | { role: 'system' | 'user' | 'assistant'; content: string }
  | {
      role: 'user';
      content: Array<
        | { type: 'text'; text: string }
        | { type: 'image_url'; image_url: { url: string } }
      >;
    };

export interface ChatOptions {
  /** Força a resposta em JSON (json_object) quando o gateway suporta */
  jsonMode?: boolean;
  /** Temperatura (default 0.2 para extrações determinísticas) */
  temperature?: number;
}

interface VisionInfo {
  hasVision: boolean;
}

/**
 * Client de IA com dois estilos de API:
 * - anthropic: POST {base}/v1/messages (Claude nativo)
 * - openai:    POST {base}/chat/completions (OpenCode Go, DeepSeek...)
 *
 * A análise de imagem (foto de produto / NF) usa o visionModel configurado,
 * porque nem todo modelo de texto aceita imagem (ex.: deepseek-v4-flash).
 */
export class AiClient {
  constructor(private readonly config: AiConfig) {}

  private isAnthropic(): boolean {
    return this.config.style === 'anthropic';
  }

  private endpoint(): string {
    return this.isAnthropic()
      ? `${this.config.baseUrl.replace(/\/$/, '')}/v1/messages`
      : `${this.config.baseUrl.replace(/\/$/, '')}/chat/completions`;
  }

  private buildBody(model: string, messages: ChatMessage[], options: ChatOptions) {
    if (this.isAnthropic()) {
      const system = messages
        .filter((m): m is { role: 'system'; content: string } => m.role === 'system')
        .map((m) => m.content)
        .join('\n\n');
      const userMessages = messages.filter((m) => m.role !== 'system');
      // Converte image_url para o formato Anthropic (image/* + base64)
      const converted = userMessages.map((m) => {
        if (m.role !== 'user' || typeof m.content === 'string') return m;
        const blocks = m.content.map((c) => {
          if (c.type === 'image_url') {
            const url = c.image_url.url;
            const match = url.match(/^data:(image\/\w+);base64,(.+)$/);
            return {
              type: 'image',
              source: {
                type: 'base64',
                media_type: (match?.[1] ?? 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
                data: match?.[2] ?? url,
              },
            };
          }
          return { type: 'text', text: c.text };
        });
        return { role: 'user', content: blocks };
      });
      return {
        model,
        max_tokens: 4096,
        system: system || undefined,
        messages: converted,
        temperature: options.temperature ?? 0.2,
        ...(options.jsonMode ? {} : {}),
      };
    }
    return {
      model,
      messages,
      temperature: options.temperature ?? 0.2,
      ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    };
  }

  private parseResponse(data: unknown): string {
    if (this.isAnthropic()) {
      const d = data as { content?: Array<{ type: string; text?: string }> };
      const text = (d.content ?? [])
        .filter((b) => b.type === 'text' && b.text)
        .map((b) => b.text)
        .join('');
      if (!text) throw new Error('IA (Anthropic) retornou resposta vazia');
      return text;
    }
    const d = data as { choices?: Array<{ message?: { content?: string } }> };
    const content = d.choices?.[0]?.message?.content;
    if (!content) throw new Error('IA retornou resposta vazia');
    return content;
  }

  private async request(model: string, messages: ChatMessage[], options: ChatOptions): Promise<string> {
    const { apiKey, timeoutMs } = this.config;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(this.endpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.isAnthropic() ? `Bearer ${apiKey}` : `Bearer ${apiKey}`,
          ...(this.isAnthropic() ? { 'anthropic-version': '2023-06-01' } : {}),
        },
        body: JSON.stringify(this.buildBody(model, messages, options)),
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`IA API error ${res.status}: ${text.slice(0, 500)}`);
      }
      const data = (await res.json()) as unknown;
      return this.parseResponse(data);
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Chat com fallback de modelo: tenta o modelo principal (Claude); se falhar,
   * tenta o fallback (DeepSeek V4 Flash).
   */
  async chatWithFallback(
    messages: ChatMessage[],
    options: ChatOptions = {},
  ): Promise<{ content: string; model: string }> {
    const attempts = [this.config.model, this.config.fallbackModel];
    const seen = new Set<string>();
    let lastError: unknown;
    for (const model of attempts) {
      if (seen.has(model)) continue;
      seen.add(model);
      try {
        const content = await this.request(model, messages, options);
        return { content, model };
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Falha em todas as tentativas de IA');
  }

  /**
   * Chat com IMAGEM (visão) usando o visionModel configurado — necessário
   * porque modelos de texto puro (ex.: deepseek-v4-flash) rejeitam image_url.
   */
  async chatVision(
    messages: ChatMessage[],
    options: ChatOptions = {},
  ): Promise<{ content: string; model: string }> {
    const attempts = [this.config.visionModel, this.config.model, this.config.fallbackModel];
    const seen = new Set<string>();
    let lastError: unknown;
    for (const model of attempts) {
      if (seen.has(model)) continue;
      seen.add(model);
      try {
        const content = await this.request(model, messages, options);
        return { content, model };
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Falha em todas as tentativas de visão');
  }

  /** Indica se um erro é de "modelo sem suporte a imagem" (400). */
  static isVisionRejected(err: unknown): boolean {
    return err instanceof Error && /400|image|vision/i.test(err.message);
  }

  /** Extrai o primeiro objeto JSON válido de um texto (tolera markdown ao redor). */
  static extractJson<T = Record<string, unknown>>(text: string): T {
    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]) as T;
        } catch {
          // segue para o erro abaixo
        }
      }
      throw new Error(`Não foi possível interpretar JSON da resposta da IA: ${text.slice(0, 300)}`);
    }
  }
}

// Manter o nome VisionInfo exportado para compatibilidade de tipos
export type { VisionInfo };
