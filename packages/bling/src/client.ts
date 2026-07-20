import { BlingConfig } from './config';

/**
 * Client tipado para a API do Bling (ERP — papel fiscal/financeiro, CLAUDE.md secao 3).
 * O Bling NAO e fonte de verdade de produto/estoque (isso continua sendo a Nuvemshop).
 * Ele entra a partir do pedido pago: emissao de NF-e e lancamentos financeiros.
 *
 * Endpoints exatos (OAuth, emissao de NF-e, contas a receber) a detalhar no
 * inicio da implementacao real — ainda nao levantados (ver escopo.md secao 16).
 */
export class BlingClient {
  private readonly baseUrl: string;

  constructor(private readonly config: BlingConfig) {
    this.baseUrl = config.baseUrl ?? 'https://www.bling.com.br/Api/v3';
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`Bling API error ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<T>;
  }

  // --- Notas fiscais ---
  invoices = {
    create: (data: unknown) => this.request('/nfe', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) => this.request(`/nfe/${id}`),
  };

  // --- Financeiro ---
  receivables = {
    create: (data: unknown) => this.request('/contasreceber', { method: 'POST', body: JSON.stringify(data) }),
  };
}
