import { z } from 'zod';

export const createAccountSchema = z.object({
  type: z.enum(['receivable', 'payable']),
  description: z.string().min(1),
  amount: z.number().positive(),
  dueDate: z.string().datetime(),
  orderId: z.string().optional(),
  supplierId: z.string().optional(),
});

export const updateAccountSchema = z.object({
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(['aberta', 'paga', 'atrasada']).optional(),
});

export type CreateAccountDto = z.infer<typeof createAccountSchema>;
export type UpdateAccountDto = z.infer<typeof updateAccountSchema>;
