import { z } from 'zod';

export const createMessageTemplateSchema = z.object({
  name: z.string().min(1),
  trigger: z.string().min(1),
  content: z.string().min(1),
  active: z.boolean().optional().default(true),
});

export const updateMessageTemplateSchema = createMessageTemplateSchema.partial();

export type CreateMessageTemplateDto = z.infer<typeof createMessageTemplateSchema>;
export type UpdateMessageTemplateDto = z.infer<typeof updateMessageTemplateSchema>;
