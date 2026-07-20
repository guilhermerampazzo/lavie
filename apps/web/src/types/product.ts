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

export interface Product {
  id: string;
  nuvemshopProductId?: string | null;
  nomePeca: string;
  banhoMaterial: string;
  cor: string;
  tamanho?: string | null;
  fecho?: string | null;
  hipoalergenico: boolean;
  nomeGerado: string;
  descricaoGerada: string;
  templateId: string;
  categoryId?: string | null;
  category?: Category | null;
  status: "draft" | "active" | "inactive";
  precoBase: string;
  precoRevendedora?: string | null;
  precoPromocional?: string | null;
  variants: Variant[];
  createdAt: string;
}

export interface ProductTemplate {
  id: string;
  name: string;
  openingParagraph: string;
  manufacturingBlock: string;
  careBlock: string;
  isDefault: boolean;
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
