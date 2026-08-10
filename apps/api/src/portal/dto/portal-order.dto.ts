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
  paymentMethod: z
    .enum(['boleto', 'pix', 'transferencia', 'credito_em_conta'])
    .default('pix'),
});

export const createReturnRequestSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().min(5, 'Informe o motivo (mín. 5 caracteres)'),
  items: z.array(
    z.object({
      sku: z.string(),
      name: z.string(),
      quantity: z.number().int().positive(),
    }),
  ),
});

export type CreatePortalOrderDto = z.infer<typeof createPortalOrderSchema>;
export type CreateReturnRequestDto = z.infer<typeof createReturnRequestSchema>;
