import { z } from 'zod';

export const createStockMovementSchema = z.object({
  variantId: z.string().min(1),
  type: z.enum(['entrada', 'saida', 'consignacao_saida', 'consignacao_retorno', 'devolucao', 'ajuste']),
  quantity: z.number().int().min(1),
  reason: z.string().optional(),
});

export type CreateStockMovementDto = z.infer<typeof createStockMovementSchema>;
