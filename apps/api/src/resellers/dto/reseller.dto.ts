import { z } from 'zod';

export const createResellerSchema = z.object({
  name: z.string().min(1),
  document: z.string().optional(),
  partnerType: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const updateResellerSchema = createResellerSchema.partial().extend({
  status: z.enum(['pendente', 'aprovada', 'bloqueada']).optional(),
});

export type CreateResellerDto = z.infer<typeof createResellerSchema>;
export type UpdateResellerDto = z.infer<typeof updateResellerSchema>;
