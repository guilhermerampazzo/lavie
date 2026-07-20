import { z } from 'zod';

export const createPortalOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export type CreatePortalOrderDto = z.infer<typeof createPortalOrderSchema>;
