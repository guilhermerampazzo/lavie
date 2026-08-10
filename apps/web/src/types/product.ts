export interface Variant {
  id: string;
  sku: string;
  cor?: string | null;
  tamanho?: string | null;
  banho?: string | null;
  preco: string;
  estoque: number;
}

export interface Category {
  id: string;
  name: string;
  nuvemshopCategoryId?: string | null;
}

export type ProductChannelType =
  | "site"
  | "nuvemshop"
  | "instagram"
  | "tiktok"
  | "mercado_livre"
  | "shopee"
  | "amazon"
  | "shein"
  | "revendedora"
  | "fisico";

export interface ProductChannel {
  id: string;
  channel: ProductChannelType;
}

export interface Supplier {
  id: string;
  name: string;
  document?: string | null;
  code?: string | null;
  contact?: string | null;
  email?: string | null;
  phone?: string | null;
  createdAt: string;
}

export type ProductStatus = "draft" | "em_revisao" | "active" | "inactive";

export interface Product {
  id: string;
  nuvemshopProductId?: string | null;
  nomePeca?: string | null;
  banhoMaterial?: string | null;
  cor?: string | null;
  tamanho?: string | null;
  fecho?: string | null;
  hipoalergenico: boolean;
  nomeGerado: string;
  descricaoGerada: string;
  templateId?: string | null;
  categoryId?: string | null;
  category?: Category | null;
  status: ProductStatus;
  precoBase: string;
  precoRevendedora?: string | null;
  precoPromocional?: string | null;
  // Módulo 2 — ficha unificada
  skuInterno?: string | null;
  tags: string[];
  tipoPeca?: string | null;
  material?: string | null;
  corAcabamento?: string | null;
  estilo?: string | null;
  colecao?: string | null;
  instrucoesConservacao?: string | null;
  precoCusto?: string | null;
  estoqueMinimo: number;
  pesoGramas?: number | null;
  dimensoes?: string | null;
  dataEntrada?: string | null;
  supplierId?: string | null;
  supplier?: Supplier | null;
  canais: ProductChannel[];
  variants: Variant[];
  images: ProductImage[];
  createdAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  position: number;
}

export interface ProductTemplate {
  id: string;
  name: string;
  openingParagraph: string;
  manufacturingBlock: string;
  careBlock: string;
  isDefault: boolean;
}

/** Resultado da análise de foto (IA) — espelha packages/ai. */
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

/** Resultado da extração de NF (IA/OCR). */
export interface InvoiceExtraction {
  fornecedor?: {
    name?: string | null;
    document?: string | null;
    code?: string | null;
    phone?: string | null;
  } | null;
  dataEmissao?: string | null;
  itens?: Array<{
    nome: string;
    codigo?: string | null;
    quantidade: number;
    precoUnitario: number;
    unidade?: string | null;
  }>;
  supplierId?: string | null;
  erro?: string;
}

export interface ProductLabel {
  id: string;
  nome: string;
  sku: string;
  material?: string | null;
  preco: string;
  precoPromocional?: string | null;
  tipoPeca?: string | null;
  codigoBarras: string;
}

export interface Coupon {
  id: string;
  nuvemshopCouponId?: string | null;
  code: string;
  type: "fixed" | "percentage" | "free_shipping";
  value?: string | null;
  usageLimit?: number | null;
  usageCount: number;
  validFrom?: string | null;
  validUntil?: string | null;
  active: boolean;
}
