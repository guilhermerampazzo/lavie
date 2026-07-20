import { z } from 'zod';

export const createProductTemplateSchema = z.object({
  name: z.string().min(1),
  openingParagraph: z.string().min(1),
  manufacturingBlock: z.string().min(1),
  careBlock: z.string().min(1),
  isDefault: z.boolean().optional().default(false),
});

export const updateProductTemplateSchema = createProductTemplateSchema.partial();

export type CreateProductTemplateDto = z.infer<typeof createProductTemplateSchema>;
export type UpdateProductTemplateDto = z.infer<typeof updateProductTemplateSchema>;
