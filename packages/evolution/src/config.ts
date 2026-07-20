export interface EvolutionConfig {
  url: string;
  apiKey: string;
}

export function loadEvolutionConfigFromEnv(): EvolutionConfig {
  return {
    url: process.env.EVOLUTION_URL ?? 'http://evolution:8080',
    apiKey: process.env.EVOLUTION_API_KEY ?? '',
  };
}
