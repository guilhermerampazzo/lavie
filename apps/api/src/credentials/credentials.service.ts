import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelKey } from '../channels/channels.service';

/**
 * Credenciais de canais e frete — salvas no banco (Setting) e editáveis pela
 * UI em /configuracoes. Nada de credencial sensível em texto puro no front:
 * a API devolve apenas flags "hasCredentials" e máscaras.
 */
export type ChannelCredentials = {
  correios?: { user?: string; password?: string; codigoAdministrativo?: string; contrato?: string; cepOrigem?: string };
  melhor_envio?: { token?: string; cepOrigem?: string };
  instagram?: { clientId?: string; clientSecret?: string; accessToken?: string };
  tiktok?: { clientId?: string; clientSecret?: string; accessToken?: string };
  mercado_livre?: { clientId?: string; clientSecret?: string; refreshToken?: string };
  shopee?: { partnerId?: string; partnerKey?: string; shopId?: string };
  amazon?: { sellerId?: string; authToken?: string; refreshToken?: string };
  shein?: { clientId?: string; clientSecret?: string };
};

const SETTING_KEY = 'channel_credentials';

const CHANNEL_META: Record<string, { label: string; fields: Array<{ key: string; label: string; secret?: boolean }> }> = {
  correios: {
    label: 'Correios (frete)',
    fields: [
      { key: 'user', label: 'Usuário' },
      { key: 'password', label: 'Senha', secret: true },
      { key: 'codigoAdministrativo', label: 'Código administrativo' },
      { key: 'contrato', label: 'Contrato' },
      { key: 'cepOrigem', label: 'CEP de origem' },
    ],
  },
  melhor_envio: {
    label: 'Melhor Envio',
    fields: [
      { key: 'token', label: 'Token de acesso', secret: true },
      { key: 'cepOrigem', label: 'CEP de origem' },
    ],
  },
  instagram: {
    label: 'Instagram Shop / Meta Commerce',
    fields: [
      { key: 'clientId', label: 'Client ID' },
      { key: 'clientSecret', label: 'Client Secret', secret: true },
      { key: 'accessToken', label: 'Access Token', secret: true },
    ],
  },
  tiktok: {
    label: 'TikTok Shop',
    fields: [
      { key: 'clientId', label: 'Client Key' },
      { key: 'clientSecret', label: 'Client Secret', secret: true },
      { key: 'accessToken', label: 'Access Token', secret: true },
    ],
  },
  mercado_livre: {
    label: 'Mercado Livre',
    fields: [
      { key: 'clientId', label: 'App ID' },
      { key: 'clientSecret', label: 'Secret Key', secret: true },
      { key: 'refreshToken', label: 'Refresh Token', secret: true },
    ],
  },
  shopee: {
    label: 'Shopee',
    fields: [
      { key: 'partnerId', label: 'Partner ID' },
      { key: 'partnerKey', label: 'Partner Key', secret: true },
      { key: 'shopId', label: 'Shop ID' },
    ],
  },
  amazon: {
    label: 'Amazon Brasil',
    fields: [
      { key: 'sellerId', label: 'Seller ID (MWS)' },
      { key: 'authToken', label: 'MWS Auth Token', secret: true },
      { key: 'refreshToken', label: 'Refresh Token', secret: true },
    ],
  },
  shein: {
    label: 'Shein',
    fields: [
      { key: 'clientId', label: 'Client ID' },
      { key: 'clientSecret', label: 'Client Secret', secret: true },
    ],
  },
};

@Injectable()
export class CredentialsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRaw(): Promise<ChannelCredentials> {
    const setting = await this.prisma.client.setting.findUnique({ where: { key: SETTING_KEY } });
    return (setting?.value as ChannelCredentials) ?? {};
  }

  /** Mapa canal -> { label, hasCredentials, masked, fields } para a UI. */
  async getStatus() {
    const raw = await this.getRaw();
    const result: Record<string, unknown> = {};
    for (const [channel, meta] of Object.entries(CHANNEL_META)) {
      const creds = (raw as Record<string, Record<string, string>>)[channel] ?? {};
      const filled = meta.fields.filter((f) => creds[f.key]?.trim());
      result[channel] = {
        label: meta.label,
        hasCredentials: filled.length > 0,
        configured: filled.length === meta.fields.length,
        fields: meta.fields.map((f) => ({
          key: f.key,
          label: f.label,
          secret: f.secret ?? false,
          hasValue: Boolean(creds[f.key]?.trim()),
        })),
      };
    }
    return result;
  }

  async save(channel: ChannelKey | 'correios' | 'melhor_envio', payload: Record<string, string>) {
    const raw = await this.getRaw();
    const meta = CHANNEL_META[channel];
    if (!meta) throw new Error(`Canal de credenciais inválido: ${channel}`);

    const clean: Record<string, string> = {};
    for (const f of meta.fields) {
      const value = payload[f.key];
      if (typeof value === 'string' && value.trim()) clean[f.key] = value.trim();
    }

    const next = { ...raw, [channel]: { ...((raw as Record<string, unknown>)[channel] as object | undefined), ...clean } };
    await this.prisma.client.setting.upsert({
      where: { key: SETTING_KEY },
      update: { value: next as never },
      create: { key: SETTING_KEY, value: next as never },
    });
    return { ok: true, channel };
  }

  async remove(channel: string) {
    const raw = await this.getRaw();
    const next = { ...raw } as Record<string, unknown>;
    delete next[channel];
    await this.prisma.client.setting.upsert({
      where: { key: SETTING_KEY },
      update: { value: next as never },
      create: { key: SETTING_KEY, value: next as never },
    });
    return { ok: true };
  }
}
