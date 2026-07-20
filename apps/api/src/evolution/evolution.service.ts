import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EvolutionClient } from '@lavie/evolution';

@Injectable()
export class EvolutionService {
  private readonly logger = new Logger(EvolutionService.name);
  readonly client: EvolutionClient;
  readonly configured: boolean;
  readonly instanceName: string;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('EVOLUTION_API_KEY') ?? '';
    // "change-me" e o placeholder do .env.example — nao conta como configurado.
    this.configured = Boolean(apiKey) && apiKey !== 'change-me';
    this.instanceName = config.get<string>('EVOLUTION_INSTANCE') ?? 'lavie';

    this.client = new EvolutionClient({
      url: config.get<string>('EVOLUTION_URL') ?? 'http://evolution:8080',
      apiKey,
    });

    if (!this.configured) {
      this.logger.warn(
        'EVOLUTION_API_KEY não configurada — envio de WhatsApp ficará indisponível até subir o Evolution (Fase 4, perfil "evolution" no docker-compose).',
      );
    }
  }
}
