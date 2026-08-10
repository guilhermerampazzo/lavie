/**
 * Configuração do provider de IA do Módulo 2.
 *
 * Dois estilos de API suportados:
 * - "anthropic": API nativa da Anthropic (POST /v1/messages) — para Claude.
 * - "openai": gateway OpenAI-compatible (POST /chat/completions) — OpenCode Go,
 *   DeepSeek V4 Flash, etc. (mesmo padrão usado pelo Hermes).
 *
 * O estilo é auto-detectado pela base URL (contém "anthropic.com") ou pode ser
 * forçado com AI_API_STYLE.
 */
export type ApiStyle = 'anthropic' | 'openai';

export interface AiConfig {
  baseUrl: string;
  apiKey: string;
  style: ApiStyle;
  /** Modelo principal (texto) — padrão Claude */
  model: string;
  /** Modelo alternativo usado quando o principal falha (DeepSeek V4 Flash) */
  fallbackModel: string;
  /** Modelo com visão para análise de imagem/foto/NF (padrão: mimo-v2.5) */
  visionModel: string;
  timeoutMs: number;
}

export const DEFAULT_MODEL = 'claude-sonnet-4-5';
export const DEFAULT_FALLBACK_MODEL = 'deepseek-v4-flash';
export const DEFAULT_VISION_MODEL = 'mimo-v2.5';

export function detectStyle(baseUrl: string): ApiStyle {
  return /anthropic/i.test(baseUrl) ? 'anthropic' : 'openai';
}

export function loadAiConfig(env: NodeJS.ProcessEnv = process.env): AiConfig {
  const baseUrl = env.AI_BASE_URL ?? 'https://opencode.ai/zen/go/v1';
  return {
    baseUrl,
    apiKey: env.AI_API_KEY ?? env.OPENCODE_GO_API_KEY ?? '',
    style: (env.AI_API_STYLE as ApiStyle) || detectStyle(baseUrl),
    model: env.AI_MODEL ?? DEFAULT_MODEL,
    fallbackModel: env.AI_FALLBACK_MODEL ?? DEFAULT_FALLBACK_MODEL,
    visionModel: env.AI_VISION_MODEL ?? DEFAULT_VISION_MODEL,
    timeoutMs: Number(env.AI_TIMEOUT_MS ?? 60_000),
  };
}

export function isAiConfigured(config: AiConfig): boolean {
  return Boolean(config.baseUrl && config.apiKey);
}
