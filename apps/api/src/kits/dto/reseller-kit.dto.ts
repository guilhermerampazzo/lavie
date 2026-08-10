import { z } from 'zod';

export const createResellerKitSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  discountPct: z.number().min(0).max(100).default(0),
  active: z.boolean().default(true),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).default(1),
      }),
    )
    .min(1),
});

export type CreateResellerKitDto = z.infer<typeof createResellerKitSchema>;
