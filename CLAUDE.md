# CLAUDE.md — Memória do Projeto "La Vie CRM"

> Documento de referência operacional para o Claude Code neste repositório.
> Fontes completas: [`escopo.md`](./escopo.md) (regras de negócio e arquitetura) e [`design.md`](./design.md) (regras visuais).
> Este arquivo resume decisões e convenções — em caso de dúvida sobre regra de negócio ou tela, consulte os dois documentos originais.

---

## 1. O que é este repositório

CRM / painel administrativo da marca de joias e semijoias **La Vie**, construído **por cima** da loja pública que já existe na Nuvemshop (`https://www.usejoiaslavie.com.br/` — **nunca tocar nela**). Fase futura: automação de atendimento via WhatsApp (Evolution API).

- Painel: `painel.usejoiaslavie.com.br`
- Evolution (fase 2): `evo.usejoiaslavie.com.br`
- Cor da marca: `#8e6f53`

---

## 2. Stack

- **TypeScript** em tudo (front e back).
- **Frontend:** Next.js 14+ (App Router) + React 18 + Tailwind + shadcn/ui (Radix) + TanStack Query + TanStack Table + Recharts + Tiptap (editor rico) + MapLibre GL JS + OSM.
- **Backend:** **NestJS separado** (`apps/api`), atrás do Caddy, na mesma porta única. Não é monolito.
- **Banco:** PostgreSQL 16 via Prisma.
- **Filas/cache:** Redis + BullMQ (sync Nuvemshop/Bling, automações, relatórios agendados).
- **Arquivos:** MinIO (S3-compatible).
- **Validação:** Zod (API e formulários).
- **Auth:** Auth.js (NextAuth) ou Lucia, sessão + RBAC (`admin`, `equipe`, `revendedora`).
- **Portal da revendedora:** dentro do **mesmo app** `apps/web`, papel `revendedora` com RBAC restrito — não é um app separado.
- Preferência absoluta por **open source**. Sempre fixar versões de imagens Docker.

---

## 3. Integrações externas — decisões fechadas

### Nuvemshop
- Fonte de verdade de **produto, variante, estoque, categoria, cupom** (CRM escreve nela via API).
- Fonte de verdade de **pedido** (Nuvemshop origina; CRM lê e enriquece).
- Client tipado único em `packages/nuvemshop/` — nada de fetch solto espalhado pelo código.
- Respeitar rate limit com fila BullMQ + retry exponencial.
- Validar endpoints/campos atuais contra a doc oficial no início da Fase 1 (podem ter mudado).

### Bling (ERP) — **entra no MVP, fase 1/2**
- Papel do Bling: **fiscal e financeiro** (emissão de NF-e, financeiro, contabilidade).
- **Não** é fonte de verdade de produto/estoque — isso continua sendo a Nuvemshop.
- Sincronizado **a partir dos pedidos** (pedido pago na Nuvemshop → CRM → gera/sincroniza no Bling).
- Client tipado em `packages/bling/`, seguindo o mesmo padrão do `packages/nuvemshop/` (fila, retry, tipos).
- Detalhar endpoints exatos da API do Bling (OAuth, emissão de NF-e, contas a receber) no início da implementação — ainda não levantados.

### Evolution API (WhatsApp — fase 2)
- Versão fixada: `atendai/evolution-api:v2.3.7` (última estável antes da exigência de licença online da v2.4.0; já traz correções de QR Code).
- Roda em `evolution:8080` (porta padrão, interna, nunca remapeada) com **Postgres e Redis próprios** (não compartilhar com o CRM).
- `packages/evolution/` nasce já na Fase 0/1 com client tipado e envs, mesmo que os fluxos só entrem na Fase 4.
- Confirmar imagem/tag exata no compose oficial do repo `evolution-foundation/evolution-api` antes de subir (projeto mudou de org em 2026).

---

## 4. Docker — regra da porta única 10215

**Regra inegociável:** só o Caddy publica porta no host (`10215`). Nenhum outro serviço (`web`, `api`, `postgres`, `redis`, `minio`, `evolution`, `evolution-postgres`, `evolution-redis`) leva `ports:` no compose — apenas `expose:`/rede interna `lavie-net`.

Caddy roteia por `Host` header:
- `painel.usejoiaslavie.com.br` → `web:3000` (e `/api` → `api:4000`)
- `evo.usejoiaslavie.com.br` → `evolution:8080`

Deploy final: VPS com aaPanel (proxy reverso de cada domínio para `127.0.0.1:10215`) + Cloudflare (`painel.*` proxy laranja ON com WebSockets habilitado; `evo.*` recomendado DNS-only/cinza para não quebrar QR Code).

---

## 5. Regra de design — nada de UI sem passar pelo Claude Design antes

**Toda tela nasce primeiro no Claude Design, em duas versões (mobile e desktop), seguindo `design.md`, ANTES de virar código.** Só depois traduzimos para shadcn/ui + Tailwind.

Resumo do essencial (completo em `design.md`):
- Paleta construída sobre `#8e6f53` (brand), com `brand-dark #6f5640`, `brand-soft #f2ece5`, `ink #1c1917`, `muted #78716c`, `line #e7e2db`, `surface #fff`, `canvas #faf8f5`, `success #3f6f4f`, `warning #a9791f`, `danger #9b3b34`.
- Tipografia: serif elegante (Fraunces/Playfair) só em títulos/KPIs; sans limpa (Inter) no resto. Números tabulares em tabelas/valores.
- Raio 10px (cards/inputs), 8px (botões). Sombra única e sutil. Nada de pill em tudo.
- Desktop: sidebar recolhível + topbar. Mobile: topbar + bottom nav, tabelas viram cards, ações em bottom sheet.
- **Não pode parecer feito por IA**: sem gradiente roxo/glassmorphism, sem tudo centralizado, sem cantos ultra-arredondados em tudo, conteúdo realista de joias (não "Lorem ipsum"). Ver seção 2 do `design.md` antes de desenhar qualquer tela.
- Toda tela de dados precisa dos 4 estados: normal, vazio, carregando, erro.
- Checklist de aprovação de tela: seção 6 do `design.md`.

---

## 6. Template de cadastro de produto (crítico — não é texto livre)

Nome montado como `[nomePeca] [banhoMaterial] [cor] Hipoalergênico`. Descrição com blocos fixos (editáveis via `product_templates`, não hardcoded) + slots variáveis (`nomePeca`, `banhoMaterial`, `cor`, `tamanho`). Preview lado a lado obrigatório antes de publicar na Nuvemshop. Suporta múltiplos templates (anel, colar, etc.), selecionável no cadastro. Detalhe completo: seção 8.3 do `escopo.md`.

---

## 6.1 Gotcha: shadcn CLI gera componentes estilo React 19 (sem forwardRef)

O registry atual do shadcn/ui assume React 19 (onde `ref` já é uma prop normal). Este projeto está fixado em **React 18.3.1** (Next 14), então componentes gerados via `npx shadcn add ...` **não encaminham `ref` automaticamente** — isso quebra silenciosamente qualquer integração com `react-hook-form` (`register()` depende do `ref`) sem gerar warning visível em build de produção. Já corrigido em `Input`. **Sempre que adicionar um novo componente shadcn que receberá `ref` (Textarea, Select, Checkbox, etc. usados com RHF), envolver em `React.forwardRef` manualmente** antes de usar.

## 7. Convenções de código

- Monorepo: `apps/web` (Next.js, painel + portal revendedora), `apps/api` (NestJS), `packages/db` (Prisma), `packages/nuvemshop`, `packages/bling`, `packages/evolution`, `packages/ui` (shadcn compartilhado).
- Toda chamada a API externa (Nuvemshop, Bling, Evolution) passa pelo package tipado correspondente — nunca fetch solto na UI ou em rotas.
- Zod em toda borda de entrada (API request, formulário).
- Modelar "canal de venda" de forma extensível desde já (marketplaces são fase futura, mas não bloquear a arquitetura).

---

## 8. Git / GitHub

- Commits em **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, etc.).
- Push para o GitHub após cada mudança concluída.
- **Antes do primeiro push, confirmar com o usuário o nome/URL do repositório GitHub** — ainda não definido.

---

## 9. Teste final — Playwright MCP

Ao final de cada fase entregável (e obrigatoriamente ao final do projeto): varrer todas as telas em desktop e mobile via Playwright MCP, validar fluxos críticos (login, cadastro de produto com template+preview, criação de cupom, filtros, pedido no portal da revendedora), checar console/links quebrados/responsividade, e corrigir o que for encontrado. Se o MCP não estiver instalado, instalar globalmente (https://playwright.dev/docs/getting-started-mcp).

---

## 10. Logo

- Arquivo atual na raiz: **`logo.webp`** (não `logo.png` — decisão tomada com o usuário: manter webp e referenciar esse arquivo em toda geração de etiqueta/PDF/tema, em vez de converter).

---

## 11. Decisões já fechadas (não reabrir sem o usuário)

| Ponto | Decisão |
|---|---|
| Backend | NestJS separado (`apps/api`), não monolito |
| Portal revendedora | Mesmo app `apps/web`, RBAC restrito, não é app separado |
| ERP | Bling, entra no MVP (fase 1/2), papel fiscal/financeiro — Nuvemshop continua fonte de verdade de produto/estoque |
| Logo | `logo.webp` na raiz (não `logo.png`) |
| Porta exposta | Só `10215`, via Caddy |
| Evolution | v2.3.7 fixo, porta 8080 interna, Postgres/Redis próprios |
| Evolution no compose | Definido desde a Fase 0 mas atrás de Docker Compose profile `evolution` (desligado por padrão até a Fase 4) |
| Monorepo | pnpm workspaces (sem Turborepo por enquanto) |

Pontos ainda em aberto (ver seção 16 do `escopo.md`, itens restantes): endpoints exatos Nuvemshop e Bling a validar no início da Fase 1; imagem/tag exata do Evolution a confirmar antes da Fase 4; nome do repositório GitHub a definir antes do primeiro push.
