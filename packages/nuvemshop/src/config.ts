export interface NuvemshopConfig {
  storeId: string;
  accessToken: string;
  userAgent: string;
  baseUrl?: string;
}

export function loadNuvemshopConfigFromEnv(): NuvemshopConfig {
  const storeId = process.env.NUVEMSHOP_STORE_ID ?? '';
  const accessToken = process.env.NUVEMSHOP_ACCESS_TOKEN ?? '';
  const userAgent = process.env.NUVEMSHOP_USER_AGENT ?? 'La Vie CRM';
  return { storeId, accessToken, userAgent };
}
