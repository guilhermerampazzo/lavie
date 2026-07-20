import { NuvemshopConfig } from './config';

/**
 * Client tipado para a API da Nuvemshop (https://api.nuvemshop.com.br/v1/{store_id}).
 * Nenhuma outra parte do codigo deve fazer fetch direto para a Nuvemshop —
 * toda escrita/leitura passa por aqui, com fila (BullMQ) e retry por cima
 * nas rotas que chamam este client.
 *
 * Endpoints e campos devem ser validados contra a doc oficial no inicio da Fase 1
 * (escopo.md secao 8.1) antes de implementar as chamadas reais.
 */
export class NuvemshopClient {
  private readonly baseUrl: string;

  constructor(private readonly config: NuvemshopConfig) {
    this.baseUrl = config.baseUrl ?? `https://api.nuvemshop.com.br/v1/${config.storeId}`;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authentication: `bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': this.config.userAgent,
        ...init.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`Nuvemshop API error ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<T>;
  }

  // --- Produtos (escopo.md 8.2) ---
  products = {
    list: (query = '') => this.request(`/products${query}`),
    get: (id: string) => this.request(`/products/${id}`),
    create: (data: unknown) => this.request('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      this.request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  };

  // --- Variantes ---
  variants = {
    update: (productId: string, variantId: string, data: unknown) =>
      this.request(`/products/${productId}/variants/${variantId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  };

  // --- Categorias ---
  categories = {
    list: () => this.request('/categories'),
    create: (data: unknown) => this.request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  };

  // --- Cupons ---
  coupons = {
    list: () => this.request('/coupons'),
    create: (data: unknown) => this.request('/coupons', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      this.request(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  };

  // --- Pedidos ---
  orders = {
    list: (query = '') => this.request(`/orders${query}`),
    get: (id: string) => this.request(`/orders/${id}`),
    updateStatus: (id: string, status: string) =>
      this.request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  };

  // --- Clientes ---
  customers = {
    list: (query = '') => this.request(`/customers${query}`),
    get: (id: string) => this.request(`/customers/${id}`),
  };

  // --- Webhooks ---
  webhooks = {
    list: () => this.request('/webhooks'),
    create: (data: unknown) => this.request('/webhooks', { method: 'POST', body: JSON.stringify(data) }),
  };
}
