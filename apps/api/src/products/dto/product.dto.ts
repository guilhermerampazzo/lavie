import { z } from 'zod';

export const productVariantSchema = z.object({
  sku: z.string().min(1),
  cor: z.string().optional(),
  tamanho: z.string().optional(),
  banho: z.string().optional(),
  preco: z.number().positive(),
  estoque: z.number().int().min(0).default(0),
});

export const createProductSchema = z.object({
  templateId: z.string().min(1),
  nomePeca: z.string().min(1),
  banhoMaterial: z.string().min(1),
  cor: z.string().min(1),
  tamanho: z.string().optional(),
  fecho: z.string().optional(),
  hipoalergenico: z.boolean().default(true),
  categoryId: z.string().optional(),
  precoBase: z.number().positive(),
  precoRevendedora: z.number().positive().optional(),
  precoPromocional: z.number().positive().optional(),
  variants: z.array(productVariantSchema).min(1),
});

export const updateProductSchema = createProductSchema.partial().extend({
  status: z.enum(['draft', 'active', 'inactive']).optional(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
