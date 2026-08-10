import { AiClient } from './client';
import { AiConfig, isAiConfigured, loadAiConfig } from './config';
import {
  INVOICE_SYSTEM_PROMPT,
  INVOICE_USER_PROMPT,
  PRODUCT_IMAGE_SYSTEM_PROMPT,
  PRODUCT_IMAGE_USER_PROMPT,
} from './prompts';

export { AiClient } from './client';
export {
  loadAiConfig,
  isAiConfigured,
  DEFAULT_MODEL,
  DEFAULT_FALLBACK_MODEL,
  DEFAULT_VISION_MODEL,
  detectStyle,
} from './config';
export type { AiConfig, ApiStyle } from './config';
export type { ChatMessage, ChatOptions } from './client';

/** Resultado da análise de foto de produto (ficha sugerida). */
export interface ProductImageAnalysis {
  nomePeca?: string | null;
  tipoPeca?: string | null;
  material?: string | null;
  banhoMaterial?: string | null;
  corAcabamento?: string | null;
  cor?: string | null;
  tamanho?: string | null;
  fecho?: string | null;
  estilo?: string | null;
  colecao?: string | null;
  estiloTags?: string[] | null;
  hipoalergenico?: boolean | null;
  descricaoSugerida?: string | null;
  erro?: string;
}

/** Item extraído da nota fiscal. */
export interface InvoiceItem {
  nome: string;
  codigo?: string | null;
  quantidade: number;
  precoUnitario: number;
  unidade?: string | null;
}

/** Dados extraídos da nota fiscal. */
export interface InvoiceExtraction {
  fornecedor?: {
    name?: string | null;
    document?: string | null;
    code?: string | null;
    phone?: string | null;
  } | null;
  dataEmissao?: string | null;
  itens?: InvoiceItem[];
  erro?: string;
}

function imageToDataUrl(base64: string, mime: string): string {
  return `data:${mime || 'image/jpeg'};base64,${base64.replace(/^data:image\/\w+;base64,/, '')}`;
}

/**
 * Serviço de IA do Módulo 2 — análise de fotos de produto e OCR de NF.
 * Usa Claude por padrão com fallback automático para DeepSeek V4 Flash.
 */
export class AiService {
  readonly client: AiClient;
  readonly configured: boolean;

  constructor(config: AiConfig = loadAiConfig()) {
    this.client = new AiClient(config);
    this.configured = isAiConfigured(config);
  }

  /**
   * Analisa a foto de uma peça e sugere a ficha do produto.
   * @param imageBase64 imagem em base64 (sem prefixo data:)
   * @param mime tipo MIME (image/jpeg, image/png, image/webp)
   */
  async analyzeProductImage(
    imageBase64: string,
    mime = 'image/jpeg',
  ): Promise<ProductImageAnalysis> {
    if (!this.configured) {
      throw new Error(
        'IA não configurada — preencha AI_API_KEY (ou OPENCODE_GO_API_KEY) no .env.',
      );
    }

    const dataUrl = imageToDataUrl(imageBase64, mime);
    // Tarefa de visão: usa o visionModel (modelos de texto puro rejeitam imagem)
    const { content } = await this.client.chatVision(
      [
        { role: 'system', content: PRODUCT_IMAGE_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: PRODUCT_IMAGE_USER_PROMPT },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      { jsonMode: true, temperature: 0.2 },
    );

    const parsed = AiClient.extractJson<ProductImageAnalysis>(content);
    const tags = parsed.estiloTags;
    return { ...parsed, estiloTags: Array.isArray(tags) ? tags.filter(Boolean) : [] };
  }

  /**
   * Extrai fornecedor e itens de uma nota fiscal (imagem).
   * @param imageBase64 imagem da NF em base64
   * @param mime tipo MIME
   */
  async extractInvoice(imageBase64: string, mime = 'image/jpeg'): Promise<InvoiceExtraction> {
    if (!this.configured) {
      throw new Error(
        'IA não configurada — preencha AI_API_KEY (ou OPENCODE_GO_API_KEY) no .env.',
      );
    }

    const dataUrl = imageToDataUrl(imageBase64, mime);
    // Tarefa de visão: usa o visionModel (modelos de texto puro rejeitam imagem)
    const { content } = await this.client.chatVision(
      [
        { role: 'system', content: INVOICE_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: INVOICE_USER_PROMPT },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      { jsonMode: true, temperature: 0 },
    );

    return AiClient.extractJson<InvoiceExtraction>(content);
  }
}
