import { z } from 'zod';

export const sendMessageSchema = z.object({
  content: z.string().min(1),
});

export const updateConversationSchema = z.object({
  status: z.enum(['aberta', 'em_atendimento', 'resolvida']).optional(),
  assignedTo: z.string().optional(),
});

export type SendMessageDto = z.infer<typeof sendMessageSchema>;
export type UpdateConversationDto = z.infer<typeof updateConversationSchema>;
