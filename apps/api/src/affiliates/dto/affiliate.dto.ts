import { z } from 'zod';

export const createAffiliateSchema = z.object({
  name: z.string().min(1),
  handle: z.string().optional(),
  channel: z.string().optional(),
  followers: z.number().int().nonnegative().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export const updateAffiliateSchema = createAffiliateSchema.partial();

export const createTrackingLinkSchema = z.object({
  couponCode: z.string().optional(),
  utmSource: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export const createCommissionSchema = z.object({
  amount: z.number().positive(),
  orderId: z.string().optional(),
  status: z.enum(['pendente', 'aprovado', 'pago']).optional(),
});

export type CreateAffiliateDto = z.infer<typeof createAffiliateSchema>;
export type UpdateAffiliateDto = z.infer<typeof updateAffiliateSchema>;
export type CreateTrackingLinkDto = z.infer<typeof createTrackingLinkSchema>;
export type CreateCommissionDto = z.infer<typeof createCommissionSchema>;
