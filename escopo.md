# Escopo Técnico — CRM / Painel Administrativo "La Vie"

> Documento de referência para desenvolvimento no Claude Code.
> Plataforma Digital La Vie — Joias e Semijoias.
> Loja: https://www.usejoiaslavie.com.br/ · Painel: painel.usejoiaslavie.com.br · Evolution: evo.usejoiaslavie.com.br · Cor da marca: `#8e6f53`
> A loja pública já existe na **Nuvemshop**. Este repositório é o **CRM + painel administrativo** que orquestra tudo por cima dela, com fase seguinte de **automação (WhatsApp)**.

---

## 1. Objetivo do repositório

Construir o núcleo de gestão da operação La Vie: um painel administrativo único onde a equipe gerencia produtos, cupons, clientes, afiliadas, influenciadoras, revendedoras, pedidos e métricas — sincronizado com a loja Nuvemshop via API — e preparado para receber, numa segunda fase, o módulo de automação e atendimento via WhatsApp (Evolution API).

A loja pública (vitrine, checkout, pagamento) **permanece na Nuvemshop**. Este projeto **não** reconstrói a loja. Ele é a camada de inteligência e operação por cima dela.

---

## 2. Stack — linguagens e frameworks

Preferência absoluta por **open source** em todas as escolhas.

### Linguagens
- **TypeScript** em todo o projeto (front e back).
- **SQL** (via Prisma) para o banco.

### Frontend
- **Next.js 14+ (App Router)** + **React 18** + **TypeScript**.
- **Tailwind CSS** para estilo.
- **shadcn/ui** (Radix + Tailwind, open source) como base de componentes do painel.
- **TanStack Query** para data-fetching/cache no cliente.
- **TanStack Table** para tabelas/listagens (clientes, pedidos, produtos).
- **Recharts** para gráficos do dashboard.
- **Tiptap** para os campos de texto rico (descrição de produto, materiais de apoio) — ver seção 9.
- **MapLibre GL JS** + tiles OpenStreetMap para o mapa — ver seção 10.

### Backend
- **NestJS + Prisma** (padrão do dev) como API, OU **Next.js Route Handlers** se optarmos por monolito. **Decisão recomendada abaixo (seção 4).**
- **PostgreSQL 16** como banco principal.
- **Redis** + **BullMQ** para filas e jobs (sincronização Nuvemshop, disparos de automação, relatórios agendados).
- **Zod** para validação de schemas (entrada de API e formulários).

### Armazenamento de arquivos
- **MinIO** (S3-compatible, open source) para imagens de produto, materiais de divulgação, documentos de revendedoras e logos de etiqueta.

### Integrações externas
- **Nuvemshop API** (produtos, variantes, cupons, pedidos, categorias, webhooks) — seção 8.
- **Evolution API v2.3.7** (WhatsApp — fase 2) — seção 7.

### Autenticação
- **Auth.js (NextAuth)** ou **Lucia** (ambos open source), com sessão + RBAC por papéis (`admin`, `equipe`, `revendedora`). O portal de revendedoras usa o mesmo sistema de auth com papel restrito.

---

## 3. Estrutura de pastas

```
/  (raiz do repositório)
├── logo.png                  ← LOGO FICA NA RAIZ (usado em etiqueta, PDF, painel)
├── CLAUDE.md                 ← memória de projeto para o Claude Code
├── escopo.md                 ← este documento
├── docker-compose.yml        ← orquestração (seção 4)
├── Caddyfile                 ← reverse proxy interno, única porta exposta
├── .env.example
├── apps/
│   ├── web/                  ← Next.js (painel + portal revendedora)
│   └── api/                  ← NestJS (se optarmos por API separada)
├── packages/
│   ├── db/                   ← schema Prisma + migrations + client
│   ├── nuvemshop/            ← client da API Nuvemshop + tipos
│   ├── evolution/            ← client Evolution API (fase 2)
│   └── ui/                   ← componentes compartilhados (shadcn)
└── docker/
    ├── web.Dockerfile
    └── api.Dockerfile
```

> **Regra:** o `logo.png` (arquivo real da logo La Vie) precisa estar na **raiz da pasta**, conforme pedido. Ele é referenciado pela geração de etiqueta, pelos PDFs e pelo tema visual do painel.

---

## 4. Docker e rede — porta única 10215

**Requisito firme:** todos os serviços rodam em rede interna Docker; **apenas UMA porta é exposta ao host: `10215`.**

### Arquitetura de rede
Um único container de **reverse proxy (Caddy — open source, já usado pelo dev)** é a porta de entrada. Tudo o mais fica na rede interna `lavie-net` sem publicar portas no host.

```
Internet → aaPanel (sites → 127.0.0.1:10215) → Caddy (única porta exposta: 10215)
   Host: painel.usejoiaslavie.com.br → web (Next.js) :3000  e  /api → api (NestJS) :4000
   Host: evo.usejoiaslavie.com.br    → evolution :8080
Rede interna lavie-net (sem publicar no host):
   postgres:5432 · redis:6379 · minio:9000 · evolution:8080
```

### Serviços do `docker-compose.yml`
| Serviço | Imagem | Porta interna | Exposta no host? |
|---|---|---|---|
| `caddy` | `caddy:2-alpine` | 80/443 → mapeado para **10215** | **SIM — só ela** |
| `web` | build local (Next.js) | 3000 | não |
| `api` | build local (NestJS) | 4000 | não |
| `postgres` | `postgres:16-alpine` | 5432 | não |
| `redis` | `redis:7-alpine` | 6379 | não |
| `minio` | `minio/minio` | 9000/9001 | não |
| `evolution` | `atendai/evolution-api:v2.3.7` | **8080 (padrão)** | não |
| `evolution-postgres` | `postgres:16-alpine` | 5432 | não |
| `evolution-redis` | `redis:7-alpine` | 6379 | não |

> **Mapeamento de porta:** apenas o Caddy publica no host, na forma `"10215:80"` (ou `10215:443` com TLS interno). Nenhum outro serviço leva `ports:` no compose — apenas `expose:` para a rede interna.

> **Evolution nas portas padrão:** o container Evolution roda na porta **8080 padrão dentro da rede Docker** (nunca remapeada), justamente para não gerar os bugs de QR Code/pareamento. O CRM fala com ele internamente em `http://evolution:8080`. Ele não publica porta própria no host — o acesso externo (e o Evolution Manager) chega por `evo.usejoiaslavie.com.br` roteado pelo **Caddy**, protegido por API key. Manter Cloudflare em DNS-only nesse subdomínio (ver seção 5).

---

## 5. Deploy — aaPanel + Cloudflare

### Domínios
| Serviço | Domínio | Observação |
|---|---|---|
| Loja pública (já existe) | `https://www.usejoiaslavie.com.br/` | Nuvemshop — **não mexer** |
| CRM / Painel | `painel.usejoiaslavie.com.br` | este projeto |
| Evolution API (fase 2) | `evo.usejoiaslavie.com.br` | WhatsApp |

### Configuração
- O deploy final roda numa VPS com **aaPanel + Docker**.
- No aaPanel, cria-se um **site** para `painel.usejoiaslavie.com.br` fazendo **proxy reverso para `127.0.0.1:10215`** (a porta exposta pelo Caddy do compose).
- O **Caddy** roteia por hostname (Host header), então `painel.*` e `evo.*` podem entrar pela mesma porta 10215 — mantendo a regra de **uma única porta exposta**. O aaPanel cria um site para cada subdomínio, ambos apontando para `127.0.0.1:10215`; o Caddy decide para qual serviço interno mandar.
- **Cloudflare:**
  - `painel.usejoiaslavie.com.br` → pode ficar com a **nuvemzinha laranja (proxy) ligada**. Habilitar **WebSockets** no Cloudflare (Network → WebSockets ON) para não quebrar realtime/notificações do painel.
  - `evo.usejoiaslavie.com.br` → **recomendado deixar em cinza (DNS only / proxy desligado)**. O proxy laranja pode interferir no WebSocket/QR Code do WhatsApp e reintroduzir o problema de pareamento. Se precisar do laranja, testar QR antes e manter WebSockets ON.
- SSL: usar SSL do próprio aaPanel (Let's Encrypt) **ou** modo Full do Cloudflare. Definir um dos dois por domínio para evitar loop de redirect.
- Firewall aaPanel: liberar só 80/443 (o 10215 fica atrás do proxy dos sites, não precisa abrir externamente).

---

## 6. Módulos do CRM (mapeados do escopo original)

O documento de escopo do sistema descreve 9 módulos. Este repositório implementa a **camada administrativa** deles. Prioridade por fase na seção 12.

1. **Dashboard Executivo** — métricas de vendas por canal, estoque, ranking de revendedoras/afiliadas, alertas em tempo real (pedido parado, estoque esgotado ativo, VIP inativo, revendedora aguardando aprovação).
2. **Cadastro de Produtos** — ficha unificada + **template de nome e descrição padronizado** (seção 8.3) + publicação na Nuvemshop.
3. **Clientes** — dados, histórico, segmentação automática (VIP, Fiel, Novo, A Reativar, Aniversariantes, Carrinho abandonado), pontuação/fidelidade.
4. **Afiliadas e Influenciadoras** — perfil, link/cupom de rastreio, comissão, conversões, ROI, ranking, material de divulgação.
5. **Revendedoras e Lojas Parceiras** — cadastro, tabela de preços própria, pedidos, consignação, saldo/comissões, documentos, status.
6. **Portal de Revendedoras** — área logada com catálogo de preço diferenciado, pedidos e materiais (mesmo repositório, papel `revendedora`). Fluxo de captação em 5 passos do escopo.
7. **Automação e Atendimento** — **fase 2**, via Evolution API.
8. **Integrações de Canais** — Nuvemshop primeiro; marketplaces são fase futura (não bloquear arquitetura).
9. **Analytics e Relatórios** — relatórios de vendas, afiliadas e financeiro; exportação PDF/Excel; relatórios automáticos agendados (BullMQ).

---

## 7. Integração Evolution API (WhatsApp — Fase 2)

- **Versão fixada: `atendai/evolution-api:v2.3.7`.**
  - Motivo: é a **última versão estável antes da exigência obrigatória de ativação de licença** (introduzida na v2.4.0, que retorna `HTTP 503 LICENSE_REQUIRED` até validar online — risco de travar em produção).
  - A v2.3.7 já traz as correções de reconexão e do loop de QR Code (os bugs de QR afetavam as versões antigas 2.1.x e 2.2.0).
  - Antes de subir, confirmar o caminho exato da imagem no `docker-compose` oficial do repo `evolution-foundation/evolution-api` (o projeto migrou de org em 2026).
- Roda na **porta padrão 8080** na rede interna, com **PostgreSQL e Redis próprios** (não compartilhar o banco do CRM).
- Comunicação CRM → Evolution por REST interno + **webhooks** do Evolution para a API do CRM (fila BullMQ processa os eventos).
- Fluxos previstos (fase 2): boas-vindas, confirmação de pedido, notificação de envio/rastreio, reativação, aniversário, carrinho abandonado, lançamento de coleção, grupo VIP, cashback/pontos, e atendimento com caixa unificada.
- `package/evolution/` já deve nascer na fase 1 com o client tipado e as variáveis de ambiente, mesmo que os fluxos só entrem na fase 2.

---

## 8. Integração Nuvemshop (parte central — completa)

O CRM deve ser o **ponto único de operação**: cadastrar/editar produtos, variantes, categorias, cupons e ler pedidos **sem precisar entrar no admin da Nuvemshop**. Sincronização bidirecional via API + webhooks.

### 8.1 Autenticação e base
- Autenticação via **OAuth / Access Token** da Nuvemshop (App). Guardar `store_id` e `access_token` em variável de ambiente/secret.
- Header obrigatório de `User-Agent` identificando o app (exigência da Nuvemshop).
- Respeitar **rate limit** com fila (BullMQ) e retry exponencial. Nunca disparar em rajada.
- Toda escrita passa por uma camada `packages/nuvemshop/` tipada; nada de fetch solto espalhado.

### 8.2 Recursos que o CRM gerencia via API
| Recurso | Operações no CRM | Endpoint de referência* |
|---|---|---|
| **Produtos** | listar, criar, editar, ativar/desativar, publicar | `/products` |
| **Variantes** | criar/editar por SKU (tamanho, cor, banho), preço, estoque | `/products/{id}/variants` |
| **Imagens** | upload/ordenar/remover imagens do produto | `/products/{id}/images` |
| **Categorias** | criar/vincular categoria e subcategoria | `/categories` |
| **Cupons** | **criar, editar, ativar, expirar** (valor fixo, %, frete grátis, limites de uso, validade) | `/coupons` |
| **Pedidos** | ler, filtrar por status/canal, atualizar status | `/orders` |
| **Clientes** | ler/sincronizar cadastro | `/customers` |
| **Webhooks** | registrar e receber eventos | `/webhooks` |

\* Caminhos sob `https://api.nuvemshop.com.br/v1/{store_id}/...`. **Validar os endpoints e campos atuais contra a doc oficial da Nuvemshop no início do desenvolvimento**, pois versão/campos podem mudar.

### 8.3 Padrão de cadastro de produto — TEMPLATE (crítico)

O cadastro de produto no CRM **não** é texto livre. Ele segue um **template com partes fixas e slots variáveis**, para manter identidade e padronização. A equipe preenche só os campos variáveis; o CRM monta nome e descrição automaticamente e envia para a Nuvemshop.

**Campos variáveis (input da equipe):**
- `nomePeca` (ex.: `Pulseira Riviera Majesté`)
- `banhoMaterial` (ex.: `Banho de Ródio Branco`)
- `cor` (ex.: `Prata`)
- `tamanho` / `fecho` (ex.: `fecho joia`)
- `hipoalergenico` (boolean, default `true`)

**Regra de montagem do NOME:**
```
[nomePeca] [banhoMaterial] [cor] [Hipoalergênico?]
```
Exemplo gerado:
```
Pulseira Riviera Majesté Banho de Ródio Branco Prata Hipoalergênico
```

**Template da DESCRIÇÃO** (partes fixas em texto; slots entre `{{ }}`):
```
Sofisticada e deslumbrante, a {{nomePeca}} combina brilho intenso com design
luxuoso em cravação impecável. Seu fecho joia garante mais segurança, elegância
e acabamento refinado, trazendo o padrão de uma verdadeira peça premium.
Banhada em {{banhoMaterial}}, é perfeita para quem busca imponência, brilho e
sofisticação em cada detalhe.

Tamanho: {{tamanho}}
✓ Hipoalergênico
Material: {{banhoMaterial}}
Cor: {{cor}}

Nossas peças passam por um rigoroso processo de fabricação, com remoção de níquel
e aplicação de paládio, proporcionando maior qualidade, resistência e segurança.
Para garantir um acabamento superior, recebem um verniz importado de alta
performance, que protege a peça contra o desgaste natural e contribui para uma
durabilidade excepcional, mantendo seu brilho e beleza por muito mais tempo.

CUIDE DA SUA La Vie
Ela é tão preciosa quanto você.
Para que ela fique linda por muito mais tempo, temos algumas dicas importantes:

• Retire-as antes de dormir e tomar banho.
• Evite usá-las na praia ou na piscina.
• Evite o contato com suor extremo (atividade física), perfume, filtro solar,
  cremes e produtos de limpeza. Esses produtos possuem ativos que podem oxidá-las
  e deixá-las sem brilho.
• Além disso, recomendamos guardá-las individualmente para evitar que se quebrem,
  amassem ou arranhem.

Para limpá-las, recomendamos:

• Usar sabão líquido ou neutro, utilizar água morna, secá-las muito bem com uma
  toalha ou secador.
• Nunca utilize álcool, seja líquido ou em gel.
```

**Requisitos do gerador de template:**
- Os blocos "processo de fabricação" e "CUIDE DA SUA La Vie" são **100% fixos** e ficam salvos uma vez só na configuração do sistema (editáveis pela gestão, mas reutilizados em todo produto).
- O parágrafo de abertura e a ficha (Tamanho/Material/Cor) usam os slots variáveis.
- Deve haver **preview lado a lado** (variáveis preenchidas → nome + descrição finais) antes de enviar à Nuvemshop.
- O template precisa ser **configurável** no painel (a gestão pode ajustar os textos fixos sem tocar em código), guardado em tabela `product_templates`.
- Suportar **mais de um template** no futuro (ex.: template para anel, para colar), selecionável no cadastro.

### 8.4 Sincronização
- **Webhooks Nuvemshop** para: pedido criado/pago, produto atualizado, cliente criado. Recebidos pela API do CRM e processados em fila.
- Job periódico de reconciliação (estoque/pedidos) para cobrir eventuais webhooks perdidos.
- Estratégia de fonte de verdade a definir por entidade: **produto/estoque/cupom = CRM escreve na Nuvemshop**; **pedido = Nuvemshop origina, CRM lê e enriquece**.

---

## 9. Editor de texto rico — Tiptap (estilo Word)

Onde houver texto rico (descrição de produto complementar, materiais de apoio, observações longas, textos de divulgação para afiliadas), usar **Tiptap** (open source, headless, sobre ProseMirror).

Recursos mínimos, o mais próximo possível do Word:
- Negrito, itálico, sublinhado, títulos (H1–H3), listas ordenadas e não ordenadas, citações, linha divisória.
- **Inserir link** (com edição/remover).
- **Inserir imagem** (upload para o MinIO + colar por URL + arrastar e soltar).
- Alinhamento de texto, cores, realce.
- Tabelas (extensão `@tiptap/extension-table`).
- Saída em HTML **e** JSON (guardar JSON no banco, renderizar HTML no destino).
- Barra de ferramentas fixa, visual limpo, coerente com o resto do painel (shadcn).

Extensões-base: `@tiptap/react`, `starter-kit`, `image`, `link`, `table`, `text-align`, `color`, `highlight`, `placeholder`.

---

## 10. Mapa — open source, moderno e bonito

- **MapLibre GL JS** (open source, fork livre do Mapbox GL) + tiles **OpenStreetMap** (ou provedor de tiles gratuito compatível).
- Estilo moderno/minimalista (base clara, poucos elementos), coerente com a identidade La Vie.
- Uso previsto: localização de revendedoras/lojas parceiras e visão geográfica de pedidos/consignação. Marcadores customizados, clusters quando houver muitos pontos, popup com resumo ao clicar.
- Nada de dependência paga; se precisar de geocoding, usar **Nominatim** (OSM) com cache e respeito ao rate limit.

---

## 11. Design — todas as páginas via Claude Design

> **A especificação completa de telas, tokens e diretrizes visuais está no arquivo [`design.md`](./design.md).** Esta seção é só o resumo.

**Regra de fluxo de trabalho:** antes de escrever qualquer código de UI de uma tela, gerar o layout no **Claude Design**, em **duas versões: mobile e desktop**, seguindo o `design.md`.

- **Cor principal da marca: `#8e6f53`** (taupe/mocha quente, tirado do site oficial). A paleta do painel é construída em cima dela — ver `design.md`.
- Buscar **referências modernas e bonitas de CRM**, com foco em **minimalismo**: bastante respiro (whitespace), tipografia clara, hierarquia forte, poucos acentos de cor, cards limpos, tabelas densas porém legíveis, estados vazios bem desenhados.
- **Não pode parecer feito por IA** (gradientes roxos genéricos, excesso de emoji, tudo centralizado, cantos exageradamente arredondados). Diretrizes anti-"cara de IA" no `design.md`.
- Componentização em cima de **shadcn/ui**; o design gerado no Claude Design é traduzido para esses componentes.
- Todas as telas precisam funcionar bem em **celular** (a gestão vai usar no telefone) e em **desktop**.

---

## 12. Etapas de desenvolvimento (roadmap)

### Fase 0 — Fundação
- Monorepo, Docker Compose com porta única 10215, Caddy, Postgres, Redis, MinIO.
- Prisma + schema inicial + migrations.
- Auth.js/Lucia com RBAC (`admin`, `equipe`, `revendedora`).
- `logo.png` na raiz; tema/design system base (Claude Design → shadcn).
- `CLAUDE.md` e este `escopo.md` versionados.

### Fase 1 — Núcleo Nuvemshop + Produtos
- `packages/nuvemshop/` (client tipado, OAuth, rate limit, retry).
- Cadastro de produto com **template de nome + descrição** (seção 8.3) e preview.
- Publicação de produto/variantes/imagens/categorias na Nuvemshop.
- **Gestão de cupons** completa via API.
- Recebimento de **webhooks** + fila BullMQ.

### Fase 2 — CRM (pessoas)
- Clientes: cadastro, histórico, **segmentação automática**, pontuação/fidelidade.
- Afiliadas/Influenciadoras: perfil, link/cupom de rastreio, comissão, ROI, ranking, material (Tiptap).
- Revendedoras: cadastro, tabela de preços própria, consignação, documentos (MinIO), status.

### Fase 3 — Dashboard, Portal e Analytics
- Dashboard executivo com métricas + alertas em tempo real.
- Portal da revendedora (catálogo com preço diferenciado, pedidos, materiais).
- Relatórios (vendas, afiliadas, financeiro) + exportação PDF/Excel + relatórios agendados.
- Mapa (MapLibre) de revendedoras/pedidos.

### Fase 4 — Automação e Atendimento (Evolution API v2.3.7)
- Subir Evolution (8080 interno, Postgres/Redis próprios).
- Caixa de entrada unificada + fluxos de follow-up e marketing.
- Sugestão de produtos por IA no atendimento.

### Fase 5 — Teste E2E completo (Playwright MCP)
Ao final de cada fase entregável e obrigatoriamente ao final do projeto, rodar um **teste completo do site/painel usando o Playwright MCP**:
- Navegar por **todas as telas** (login, dashboard, produtos, cupons, clientes, afiliadas, revendedoras, portal, pedidos, relatórios, configurações), em **desktop e mobile**.
- Validar fluxos críticos: login/logout, cadastro de produto com template + preview, criação de cupom, filtros de listagem, criação de pedido no portal da revendedora.
- Verificar **falhas, erros de console, links quebrados, estados vazios, responsividade e regressões visuais**. Reportar tudo e corrigir.
- **Se o Playwright MCP não estiver instalado, instalar globalmente** seguindo a documentação oficial: https://playwright.dev/docs/getting-started-mcp

> Marketplaces (ML, Shopee, Amazon, Shein, TikTok) ficam para fase futura. Modelar o domínio de "canal de venda" de forma extensível desde já, mas **não implementar** agora.

---

## 13. Modelo de dados — entidades principais (Prisma)

Rascunho de entidades a detalhar na Fase 0 (campos-chave):

- `User` (equipe/admin/revendedora) · `Role` · `Session`
- `Product` (dados internos) ↔ `nuvemshopProductId` · `Variant` (SKU, cor, tamanho, banho, preço, estoque) · `ProductImage`
- `ProductTemplate` (blocos fixos + estrutura de slots) · `Category`
- `Coupon` ↔ `nuvemshopCouponId`
- `Customer` (↔ `nuvemshopCustomerId`) · `CustomerSegment` (regra configurável) · `LoyaltyPoints`
- `Affiliate` (perfil, canal, seguidores) · `TrackingLink` (UTM/cupom) · `Commission` (status: pendente/aprovado/pago) · `Campaign`
- `Reseller` (dados, tipo parceria, status) · `ResellerPriceTable` · `Consignment` · `ResellerOrder` · `ResellerDocument`
- `Order` (↔ `nuvemshopOrderId`, canal, status) · `OrderItem`
- `Automation` / `MessageTemplate` / `Conversation` / `Message` (fase 4)
- `WebhookEvent` (auditoria de eventos recebidos) · `SyncJob`
- `Setting` (templates, chaves de integração, parâmetros configuráveis: limiares de VIP, dias de reativação etc.)

---

## 14. Variáveis de ambiente (`.env.example`)

```
# App
APP_PORT_INTERNAL=3000
API_PORT_INTERNAL=4000
PUBLIC_URL=https://painel.usejoiaslavie.com.br
STORE_URL=https://www.usejoiaslavie.com.br

# Postgres (CRM)
DATABASE_URL=postgresql://lavie:***@postgres:5432/lavie

# Redis (CRM)
REDIS_URL=redis://redis:6379

# MinIO
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=***
MINIO_SECRET_KEY=***
MINIO_BUCKET=lavie

# Auth
AUTH_SECRET=***

# Nuvemshop
NUVEMSHOP_STORE_ID=***
NUVEMSHOP_ACCESS_TOKEN=***
NUVEMSHOP_USER_AGENT=La Vie CRM (contato@lavie.com.br)

# Evolution API (fase 2)
EVOLUTION_URL=http://evolution:8080          # interno (CRM → Evolution)
EVOLUTION_PUBLIC_URL=https://evo.usejoiaslavie.com.br
EVOLUTION_API_KEY=***
```

---

## 15. Regras de trabalho para o Claude Code

- **`CLAUDE.md`** na raiz como memória de projeto (stack, convenções, comandos, decisões).
- **Antes de qualquer código de UI:** gerar layout no **Claude Design** (mobile + desktop), buscando referências modernas e minimalistas de CRM.
- **Commits:** Conventional Commits.
- **Push para o GitHub após cada mudança concluída.**
- **`--dangerously-skip-permissions`** conforme fluxo habitual do dev.
- Sempre preferir **open source** e fixar versões de imagens Docker.
- Nunca publicar porta no host além da **10215**.
- Evolution sempre na **porta 8080 interna** e versão **v2.3.7**.
- **Design antes do código:** toda tela nasce no Claude Design (mobile + desktop) conforme `design.md`.
- **Teste ao final com Playwright MCP:** varrer o site completo, achar falhas e corrigir. Se o MCP não estiver instalado, instalar global via https://playwright.dev/docs/getting-started-mcp

> **Repositório GitHub:** confirmar o nome/URL do repositório antes do primeiro push. Se ainda não existir, definir o nome antes de criar.

---

## 16. Pontos em aberto / decisões a confirmar

1. **Backend:** NestJS separado (alinhado ao padrão do dev, `apps/api`) **ou** monolito em Next.js Route Handlers (mais simples para porta única)? *Recomendação: NestJS separado atrás do Caddy, mantendo uma só porta exposta.*
2. **Fonte de verdade** por entidade (produto/estoque/cupom escritos pelo CRM; pedido originado na Nuvemshop) — validar com a operação.
3. **ERP (Bling/Olist):** o escopo original prevê ERP. Entra neste repositório ou fica fora do MVP? *Sugestão: fora do MVP, modelar de forma extensível.*
4. **Login das revendedoras:** mesmo app com papel restrito (recomendado) confirmado?
5. **Endpoints/campos atuais da Nuvemshop** a serem verificados contra a doc oficial no início da Fase 1.
6. **Imagem/tag exata do Evolution** a confirmar no docker-compose oficial do repo `evolution-foundation`.

---

*Documento vivo. Ajustes e priorizações podem ser acordados antes de cada fase.*
