import { z } from 'zod';

export const updateOrderStatusSchema = z.object({
  status: z.enum(['novo', 'pago', 'em_separacao', 'embalado', 'enviado', 'entregue', 'cancelado']),
  trackingCode: z.string().optional(),
});

export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
