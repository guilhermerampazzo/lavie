import { BlingConfig } from './config';

/**
 * Client tipado para a API v3 do Bling (ERP — papel fiscal/financeiro).
 *
 * IMPORTANTE (descoberto em produção): a API v3 exige o host
 * `api.bling.com.br` (tokens JWT são recusados em www.bling.com.br com
 * FORBIDDEN). OAuth (authorize/token) também aceita o host api.*.
 */
export class BlingClient {
  private readonly baseUrl: string;

  constructor(private readonly config: BlingConfig) {
    this.baseUrl = config.baseUrl ?? 'https://api.bling.com.br/Api/v3';
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        Accept: '2.0',
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`Bling API error ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<T>;
  }

  /** Lista paginada genérica — retorna `data` do envelope { data, paging }. */
  private async list<T>(path: string): Promise<T[]> {
    const res = await this.request<{ data: T[] }>(path);
    return Array.isArray(res) ? (res as unknown as T[]) : (res.data ?? []);
  }

  // --- Notas fiscais ---
  invoices = {
    create: (data: unknown) => this.request('/nfe', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) => this.request(`/nfe/${id}`),
    list: (params: Record<string, string | number> = {}) => {
      const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
      return this.list(`/notasfiscais?${qs.toString()}`);
    },
  };

  // --- Financeiro ---
  receivables = {
    create: (data: unknown) => this.request('/contasreceber', { method: 'POST', body: JSON.stringify(data) }),
    list: (params: Record<string, string | number> = {}) => {
      const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
      return this.list(`/contasreceber?${qs.toString()}`);
    },
  };

  payables = {
    create: (data: unknown) => this.request('/contaspagar', { method: 'POST', body: JSON.stringify(data) }),
    list: (params: Record<string, string | number> = {}) => {
      const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
      return this.list(`/contaspagar?${qs.toString()}`);
    },
  };

  // --- Produtos ---
  products = {
    list: (params: Record<string, string | number> = {}) => {
      const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
      return this.list(`/produtos?${qs.toString()}`);
    },
    get: (id: string) => this.request(`/produtos/${id}`),
  };

  // --- Vendas / pedidos ---
  salesOrders = {
    list: (params: Record<string, string | number> = {}) => {
      const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
      return this.list(`/vendas?${qs.toString()}`);
    },
  };

  // --- Categorias ---
  categories = {
    list: (params: Record<string, string | number> = {}) => {
      const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
      return this.list(`/categorias?${qs.toString()}`);
    },
  };

  // --- Estoque (produtos com saldo) ---
  stock = {
    byProduct: (id: string | number) => this.request(`/produtos/${id}/estoques`),
  };

  /** Testa se o token é válido com uma chamada leve. */
  async validateToken(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.request('/departamentos?limite=1');
      return { ok: true };
    } catch (err) {
      return { ok: false, error: (err as Error).message.slice(0, 200) };
    }
  }
}
