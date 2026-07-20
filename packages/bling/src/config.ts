export interface BlingConfig {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  baseUrl?: string;
}

export function loadBlingConfigFromEnv(): BlingConfig {
  return {
    clientId: process.env.BLING_CLIENT_ID ?? '',
    clientSecret: process.env.BLING_CLIENT_SECRET ?? '',
    accessToken: process.env.BLING_ACCESS_TOKEN ?? '',
    refreshToken: process.env.BLING_REFRESH_TOKEN ?? '',
  };
}
