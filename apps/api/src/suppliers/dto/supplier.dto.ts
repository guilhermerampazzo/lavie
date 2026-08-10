import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Informe o nome do fornecedor'),
  document: z.string().optional().nullable(),
  code: z.string().optional().nullable(),
  contact: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export type CreateSupplierDto = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierDto = z.infer<typeof updateSupplierSchema>;
