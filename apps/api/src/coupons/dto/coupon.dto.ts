import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().min(1),
  type: z.enum(['fixed', 'percentage', 'free_shipping']),
  value: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
});

export const updateCouponSchema = createCouponSchema.partial().extend({
  active: z.boolean().optional(),
});

export type CreateCouponDto = z.infer<typeof createCouponSchema>;
export type UpdateCouponDto = z.infer<typeof updateCouponSchema>;
