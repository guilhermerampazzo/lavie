import { z } from 'zod';

export const productVariantSchema = z.object({
  sku: z.string().min(1),
  cor: z.string().optional(),
  tamanho: z.string().optional(),
  banho: z.string().optional(),
  preco: z.number().positive(),
  estoque: z.number().int().min(0).default(0),
});

export const productChannelSchema = z.enum([
  'site',
  'nuvemshop',
  'instagram',
  'tiktok',
  'mercado_livre',
  'shopee',
  'amazon',
  'shein',
  'revendedora',
  'fisico',
]);

/**
 * Ficha unificada do produto — escopofinal.md seção 3.
 * Todos os campos são opcionais no schema de CRIACAO para permitir entrada
 * por foto (IA), NF (OCR) ou manual, com complemento posterior.
 */
export const createProductSchema = z.object({
  // Identificação
  templateId: z.string().optional(),
  nomePeca: z.string().optional(),
  banhoMaterial: z.string().optional(),
  cor: z.string().optional(),
  tamanho: z.string().optional(),
  fecho: z.string().optional(),
  hipoalergenico: z.boolean().default(true),
  skuInterno: z.string().optional(), // se vazio, o sistema gera
  tags: z.array(z.string()).default([]),
  tipoPeca: z.string().optional(),
  material: z.string().optional(),
  corAcabamento: z.string().optional(),
  estilo: z.string().optional(),
  colecao: z.string().optional(),
  instrucoesConservacao: z.string().optional(),
  descricaoSugerida: z.string().optional(), // vinda da IA; vira descricaoGerada se não houver template

  // Preços
  precoCusto: z.number().positive().optional(),
  precoBase: z.number().positive().optional(),
  precoRevendedora: z.number().positive().optional(),
  precoPromocional: z.number().positive().optional(),

  // Estoque e fornecedor
  estoqueMinimo: z.number().int().min(0).default(0),
  pesoGramas: z.number().positive().optional(),
  dimensoes: z.string().optional(),
  dataEntrada: z.string().datetime().optional(),
  supplierId: z.string().optional(),

  // Publicação
  canais: z.array(productChannelSchema).default(['site']),
  categoryId: z.string().optional(),

  // Variações (obrigatório ter pelo menos uma para publicar na Nuvemshop)
  variants: z.array(productVariantSchema).min(1),
});

export const updateProductSchema = createProductSchema.partial().extend({
  status: z.enum(['draft', 'em_revisao', 'active', 'inactive']).optional(),
  nuvemshopProductId: z.string().optional(),
});

export const analyzeImageSchema = z.object({
  image: z.string().min(1, 'Informe a imagem em base64'),
  mime: z.string().default('image/jpeg'),
});

export const extractInvoiceSchema = z.object({
  image: z.string().min(1, 'Informe a imagem da nota em base64'),
  mime: z.string().default('image/jpeg'),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type AnalyzeImageDto = z.infer<typeof analyzeImageSchema>;
export type ExtractInvoiceDto = z.infer<typeof extractInvoiceSchema>;
