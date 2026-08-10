import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EvolutionClient } from '@lavie/evolution';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Evolution API (WhatsApp — Fase 4).
 *
 * Em produção (2026-08): a instância real se chama "crm" e a chave é a
 * AUTHENTICATION_API_KEY do container — o .env do app precisa apontar para
 * esses valores (EVOLUTION_INSTANCE=crm, EVOLUTION_API_KEY=<chave real>).
 */
@Injectable()
export class EvolutionService {
  private readonly logger = new Logger(EvolutionService.name);
  readonly client: EvolutionClient;
  readonly configured: boolean;
  readonly instanceName: string;
  private readonly publicUrl: string;

  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = config.get<string>('EVOLUTION_API_KEY') ?? '';
    // "change-me" e o placeholder do .env.example — nao conta como configurado.
    this.configured = Boolean(apiKey) && apiKey !== 'change-me';
    this.instanceName = config.get<string>('EVOLUTION_INSTANCE') ?? 'crm';
    this.publicUrl =
      config.get<string>('PUBLIC_URL') ?? 'http://localhost:10215';

    this.client = new EvolutionClient({
      url: config.get<string>('EVOLUTION_URL') ?? 'http://evolution:8080',
      apiKey,
    });

    if (!this.configured) {
      this.logger.warn(
        'EVOLUTION_API_KEY não configurada — envio de WhatsApp indisponível. Configure no .env com a chave real (AUTHENTICATION_API_KEY do container).',
      );
    }
  }

  /** Estado real da instância (connectionState) + lista de instâncias. */
  async status() {
    if (!this.configured) {
      return {
        configured: false,
        message: 'EVOLUTION_API_KEY não configurada no .env.',
      };
    }
    try {
      const instances = (await this.client.instances.fetchAll()) as Array<{
        name?: string;
        connectionStatus?: string;
        ownerJid?: string;
        profileName?: string;
      }>;
      const mine = Array.isArray(instances)
        ? instances.find((i) => i.name === this.instanceName)
        : null;
      const connection = mine
        ? {
            name: mine.name,
            connectionStatus: mine.connectionStatus,
            ownerJid: mine.ownerJid,
            profileName: mine.profileName,
          }
        : null;
      return {
        configured: true,
        connection,
        instances: Array.isArray(instances) ? instances.length : 0,
      };
    } catch (err) {
      return { configured: true, error: (err as Error).message.slice(0, 300) };
    }
  }

  /** Registra o webhook de mensagens do Evolution apontando para o painel. */
  async ensureWebhook() {
    if (!this.configured)
      return { ok: false, message: 'Evolution não configurado.' };
    const webhookUrl = `${this.publicUrl}/api/webhooks/evolution`;
    const data = {
      webhook: {
        url: webhookUrl,
        events: ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'CONNECTION_UPDATE'],
      },
    };
    await this.client.instances.setWebhook(this.instanceName, data);
    this.logger.log(`Webhook Evolution registrado: ${webhookUrl}`);
    return { ok: true, webhookUrl };
  }

  /**
   * Puxa as conversas recentes do Evolution e cria/atualiza Conversation +
   * Message no banco local — para o painel exibir sem depender de evento.
   */
  async pullChats(limit = 25) {
    if (!this.configured) return { error: 'Evolution não configurado.' };
    const chats = await this.client.chats.find(this.instanceName, { limit });

    const chatList = (chats ?? []) as Array<{
      id?: string;
      remoteJid?: string;
      name?: string;
      pushName?: string;
      messages?: Array<{
        message?: {
          conversation?: string;
          extendedTextMessage?: { text?: string };
        };
        key?: { id?: string; fromMe?: boolean };
        pushName?: string;
      }>;
    }>;

    let created = 0;
    let conversationsCreated = 0;
    for (const chat of chatList) {
      const contact = String(chat.remoteJid ?? chat.id ?? '')
        .replace(/@s\.whatsapp\.net$/, '')
        .replace(/@lid$/, '');
      if (!contact) continue;

      // Coleta mensagens com conteúdo ANTES de criar a conversa — o findChats
      // retorna chats com lastMessage, mas o array messages pode vir vazio;
      // sem mensagem real não faz sentido criar conversa vazia no painel.
      const messages = (chat.messages ?? []).filter((m) => {
        const content = m.message?.conversation ?? m.message?.extendedTextMessage?.text ?? '';
        return content.trim().length > 0;
      });
      if (messages.length === 0) continue;

      const conversation = await this.prisma.client.conversation.upsert({
        where: { contact_channel: { contact, channel: 'whatsapp' } },
        update: {},
        create: { contact, channel: 'whatsapp', status: 'aberta' },
      });
      conversationsCreated++;

      for (const m of messages) {
        const content =
          m.message?.conversation ?? m.message?.extendedTextMessage?.text ?? '';
        if (!content) continue;
        const exists = await this.prisma.client.message.findFirst({
          where: { conversationId: conversation.id, content },
        });
        if (!exists) {
          await this.prisma.client.message.create({
            data: {
              conversationId: conversation.id,
              direction: m.key?.fromMe ? 'outbound' : 'inbound',
              content,
            },
          });
          created++;
        }
      }
    }
    this.logger.log(
      `Evolution pull: ${created} mensagens novas em ${conversationsCreated} conversas (de ${chatList.length} chats)`,
    );
    return { chats: chatList.length, conversationsCreated, messagesCreated: created };
  }

  /** Liga a instância (conexão WhatsApp). Se o QR for necessário, retorna a URL. */
  async connect() {
    if (!this.configured)
      return { ok: false, message: 'Evolution não configurado.' };
    await this.client.instances.connect(this.instanceName);
    return {
      ok: true,
      message: `Instância "${this.instanceName}" conectando — escaneie o QR no Evolution (evo.usejoiaslavie.com.br).`,
    };
  }
}
