import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlingClient } from '@lavie/bling';
import { PrismaService } from '../prisma/prisma.service';

const SETTING_KEY = 'bling_oauth';

/**
 * Endpoints OAuth2 da API v3 do Bling. Seguem o padrao documentado em
 * developer.bling.com.br/aplicativos, mas a pagina de docs e renderizada
 * via JS e nao foi possivel confirmar a URL literal por scraping — testar
 * de verdade assim que houver client_id/client_secret reais (escopo.md
 * secao 16 ja marcava isso como pendente de levantamento).
 */
const BLING_AUTHORIZE_URL = 'https://www.bling.com.br/Api/v3/oauth/authorize';
const BLING_TOKEN_URL = 'https://www.bling.com.br/Api/v3/oauth/token';

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO date
}

@Injectable()
export class BlingService {
  private readonly logger = new Logger(BlingService.name);
  readonly clientId: string;
  readonly clientSecret: string;
  readonly redirectUri: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.clientId = config.get<string>('BLING_CLIENT_ID') ?? '';
    this.clientSecret = config.get<string>('BLING_CLIENT_SECRET') ?? '';
    const publicUrl = config.get<string>('PUBLIC_URL') ?? 'http://localhost:10215';
    this.redirectUri = `${publicUrl}/api/bling/callback`;

    if (!this.hasClientCredentials()) {
      this.logger.warn(
        'BLING_CLIENT_ID/BLING_CLIENT_SECRET não configurados — cadastre o app em developer.bling.com.br e preencha o .env para habilitar "Conectar ao Bling".',
      );
    }
  }

  hasClientCredentials(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  buildAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state,
    });
    return `${BLING_AUTHORIZE_URL}?${params.toString()}`;
  }

  private async getStoredTokens(): Promise<StoredTokens | null> {
    const setting = await this.prisma.client.setting.findUnique({ where: { key: SETTING_KEY } });
    return (setting?.value as unknown as StoredTokens) ?? null;
  }

  private async saveTokens(tokens: StoredTokens) {
    await this.prisma.client.setting.upsert({
      where: { key: SETTING_KEY },
      update: { value: tokens as never },
      create: { key: SETTING_KEY, value: tokens as never },
    });
  }

  async exchangeCode(code: string): Promise<void> {
    if (!this.hasClientCredentials()) {
      throw new BadRequestException('BLING_CLIENT_ID/BLING_CLIENT_SECRET não configurados.');
    }

    const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const res = await fetch(BLING_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!res.ok) {
      throw new BadRequestException(`Falha ao trocar código por token no Bling: ${await res.text()}`);
    }

    const data = (await res.json()) as { access_token: string; refresh_token: string; expires_in: number };
    const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
    await this.saveTokens({ accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt });
  }

  private async refreshTokens(refreshToken: string): Promise<StoredTokens> {
    const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const res = await fetch(BLING_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
    });
    if (!res.ok) {
      throw new BadRequestException(`Falha ao renovar token do Bling: ${await res.text()}`);
    }
    const data = (await res.json()) as { access_token: string; refresh_token: string; expires_in: number };
    const tokens: StoredTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    };
    await this.saveTokens(tokens);
    return tokens;
  }

  /** True quando ha um access_token valido (via OAuth salvo ou fallback do .env). */
  async isConnected(): Promise<boolean> {
    const stored = await this.getStoredTokens();
    if (stored) return true;
    return Boolean(this.config.get<string>('BLING_ACCESS_TOKEN'));
  }

  /** Client pronto pra uso, renovando o token automaticamente se necessario. */
  async getClient(): Promise<BlingClient> {
    let stored = await this.getStoredTokens();

    if (stored && new Date(stored.expiresAt).getTime() <= Date.now() + 60_000) {
      stored = await this.refreshTokens(stored.refreshToken);
    }

    const accessToken = stored?.accessToken ?? this.config.get<string>('BLING_ACCESS_TOKEN') ?? '';
    const refreshToken = stored?.refreshToken ?? this.config.get<string>('BLING_REFRESH_TOKEN') ?? '';

    return new BlingClient({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      accessToken,
      refreshToken,
    });
  }
}
