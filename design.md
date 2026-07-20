# Design — Painel La Vie

> Guia visual e catálogo de telas para geração no **Claude Design**.
> Regra central: **toda tela é desenhada primeiro no Claude Design, em duas versões (mobile e desktop), antes de virar código.** A tradução final é feita com **shadcn/ui + Tailwind**.

---

## 1. Princípios

O painel é uma ferramenta de trabalho de uma marca de **joias e semijoias premium**. A estética tem que transmitir cuidado e sofisticação, mas sem virar enfeite: é um CRM que a equipe usa o dia inteiro. Portanto: **elegante, calmo, minimalista e funcional**.

- **Minimalismo com intenção.** Muito respiro (whitespace), hierarquia tipográfica clara, poucos acentos de cor. O que não ajuda a decidir, sai da tela.
- **Densidade legível.** Tabelas podem ser densas (a operação tem volume), mas com boa altura de linha, zebra sutil e alinhamento numérico à direita.
- **Consistência.** Um único design system: mesmos espaçamentos, raios, sombras e componentes em todas as telas.
- **Mobile de verdade.** A gestão vai abrir no celular. Nada de "desktop encolhido" — repensar navegação, tabelas viram cards, ações viram bottom sheet.
- **Marca presente, discreta.** A cor `#8e6f53` aparece em pontos de ação e destaque, não como fundo de tela inteira.

---

## 2. NÃO PODE parecer feito por IA

Diretrizes explícitas para fugir do visual "template genérico de IA":

**Evitar:**
- Gradiente roxo/azul em tudo, glassmorphism exagerado, blobs coloridos de fundo.
- Excesso de emoji em títulos e botões.
- Tudo centralizado no meio da tela com muito espaço morto.
- Cantos ultra-arredondados (pill em tudo), sombras roxas difusas.
- Cards todos iguais, do mesmo tamanho, em grid perfeito sem hierarquia.
- Ícones decorativos aleatórios sem função.
- Texto placeholder tipo "Lorem ipsum" ou "Bem-vindo ao seu dashboard incrível!".
- Micro-interações exageradas (tudo pulsando, brilhando, flutuando).

**Buscar:**
- **Assimetria intencional** e hierarquia real (um número herói grande, o resto subordinado).
- **Conteúdo específico e realista** de joias: "Pulseira Riviera Majesté", "Banho de Ródio", "R$ 189,90", nomes de revendedoras, CNPJs, cidades brasileiras.
- **Tipografia como protagonista**, não cor. Contraste por peso e tamanho.
- **Espaçamento respirado, porém com âncoras visuais** (linhas divisórias finas, agrupamento claro).
- **Estados vazios desenhados à mão** (ilustração leve + texto útil + ação), não um ícone cinza genérico.
- **Detalhes de marca sutis**: um filete `#8e6f53`, um serif elegante só nos títulos, um selo "Hipoalergênico" bem tratado.
- Densidade de dados que mostra que uma pessoa real pensou no fluxo.

Regra de bolso: se a tela poderia ser de qualquer SaaS genérico, está errada. Ela tem que **parecer de uma joalheria**.

---

## 3. Tokens visuais

### Cores
Base construída sobre a cor da marca **`#8e6f53`**.

| Token | Valor | Uso |
|---|---|---|
| `brand` | `#8e6f53` | ação primária, destaques, seleção |
| `brand-dark` | `#6f5640` | hover/pressed da primária, títulos serif |
| `brand-soft` | `#f2ece5` | fundos de destaque, chips, seleção sutil |
| `ink` | `#1c1917` | texto principal |
| `muted` | `#78716c` | texto secundário, labels |
| `line` | `#e7e2db` | bordas, divisórias |
| `surface` | `#ffffff` | cards |
| `canvas` | `#faf8f5` | fundo da aplicação (off-white quente, não branco puro) |
| `success` | `#3f6f4f` | pago, ativo |
| `warning` | `#a9791f` | pendente, atenção |
| `danger` | `#9b3b34` | erro, esgotado, bloqueado |

Acentos de status são **discretos** (texto + ponto/badge suave), nunca cores berrantes preenchendo blocos grandes.

### Tipografia
- **Títulos / número herói:** uma serif elegante (ex.: *Fraunces* ou *Playfair Display*) — só em títulos de página e KPIs, para dar cara de marca de joia.
- **Interface / corpo / tabelas:** uma sans limpa (ex.: *Inter*).
- Números tabulares (`font-variant-numeric: tabular-nums`) em valores e tabelas.

### Forma e profundidade
- Raio: `10px` em cards e inputs, `8px` em botões. Nada de pill em tudo.
- Sombra: uma só, muito sutil (`0 1px 2px rgba(28,25,23,.06)`). Elevação por borda `line`, não por sombra pesada.
- Espaçamento base 4px; seções respiram com 24–32px.

### Layout
- **Desktop:** sidebar recolhível à esquerda + topbar (busca global, alertas, avatar). Conteúdo com largura máxima confortável, não esticado até a borda.
- **Mobile:** topbar com menu (drawer) + **bottom navigation** com os 4–5 destinos principais. Tabelas viram lista de cards. Ações principais em bottom sheet / FAB discreto.

---

## 4. Componentes recorrentes (desenhar uma vez, reusar)
Sidebar · Topbar com busca global · Bottom nav (mobile) · Card de KPI · Tabela com filtros/paginação · Card-linha (versão mobile da tabela) · Ficha lateral (drawer de detalhe) · Formulário padrão · Badge de status · Estado vazio · Estado de carregamento (skeleton) · Modal de confirmação (com nome digitado para ações destrutivas) · Toolbar do editor Tiptap · Upload de imagem (drag & drop) · Seletor de data/período · Toast.

---

## 5. Catálogo de telas

Cada tela abaixo deve ser gerada no Claude Design em **desktop + mobile**. Estados obrigatórios em telas de dados: **normal, vazio, carregando, erro**.

### 5.1 Login
- Tela dividida: à esquerda, painel de marca (fundo `canvas`, logo La Vie, um detalhe visual sóbrio de joia); à direita, formulário enxuto (e-mail, senha, entrar, esqueci a senha).
- Mobile: logo no topo, formulário abaixo, sem a coluna de marca.
- Nada de gradiente colorido de fundo.

### 5.2 Dashboard executivo
- **Faixa de KPIs** (número herói em serif): faturamento do período, ticket médio, pedidos, taxa de conversão — com variação % vs período anterior (seta discreta).
- **Vendas por canal** (barras/linha, Recharts): site, revendedoras, marketplaces, físico.
- **Ranking de revendedoras** (top 5, mini-tabela).
- **Alertas em tempo real** (lista compacta): pedido pago aguardando separação há X h, produto esgotado ainda ativo, cliente VIP inativo, revendedora aguardando aprovação. Cada alerta com ação rápida.
- Seletor de período no topo (hoje / semana / mês / custom).
- Mobile: KPIs em carrossel/stack, gráficos simplificados, alertas em lista.

### 5.3 Produtos — lista
- Tabela: imagem, nome, SKU, categoria, preço, estoque, status (badge), canais. Filtros: categoria, material, status, faixa de preço, busca.
- Ação primária: **Novo produto**.
- Mobile: cards com foto + nome + preço + estoque + status.

### 5.4 Produto — cadastro/edição (tela-chave)
- Layout em duas colunas (desktop): à esquerda o formulário, à direita **preview ao vivo**.
- **Campos variáveis do template**: nome da peça, banho/material, cor, tamanho/fecho, hipoalergênico (toggle).
- **Preview lado a lado** mostrando o **nome montado** e a **descrição completa gerada** pelo template (partes fixas + slots), exatamente como irá para a Nuvemshop.
- Variantes (SKU por cor/tamanho/banho) com preço e estoque.
- Upload de imagens (drag & drop, reordenar).
- Categorias, canais de publicação, preço de venda / revendedora / promocional.
- Botão **Publicar na Nuvemshop** com estado de sincronização.
- Mobile: formulário em passos, preview acessível por aba/botão "ver prévia".

### 5.5 Configuração de templates de produto
- Editor dos **blocos fixos** (processo de fabricação, "CUIDE DA SUA La Vie") e do parágrafo de abertura com marcação dos slots `{{ }}`.
- Suporte a múltiplos templates (ex.: anel, colar) com seleção no cadastro.
- Usa o editor **Tiptap** (toolbar estilo Word).

### 5.6 Cupons
- Lista de cupons (código, tipo, valor, usos/limite, validade, status).
- Criar/editar: valor fixo, %, frete grátis; limite de uso; validade; canais. Escreve na Nuvemshop.
- Estado vazio bem desenhado ("nenhum cupom ativo").

### 5.7 Clientes — lista + ficha
- Lista com segmento (VIP, Fiel, Novo, A Reativar, Aniversariante) como badge; busca; filtro por segmento.
- **Ficha (drawer/página)**: dados, histórico de compras (timeline), pontos de fidelidade, preferências extraídas, canal de origem, observações.
- Mobile: cards; ficha em página cheia.

### 5.8 Afiliadas e Influenciadoras
- Lista: perfil (@, canal, seguidores), conversões, receita, ROI, comissão a receber (status), ranking.
- Ficha: link/cupom de rastreio, histórico de campanhas, material de divulgação (biblioteca de imagens/textos via Tiptap + MinIO), saldo de comissões.

### 5.9 Revendedoras e Lojas Parceiras
- Lista: nome, tipo de parceria, cidade, desempenho no mês, status, saldo.
- Ficha: tabela de preços própria, pedidos, **estoque em consignação** (status retorno/venda), documentos (upload), saldo/comissões.
- **Aprovação de novas revendedoras** (fila de pendentes → validar → criar acesso).

### 5.10 Portal da Revendedora (papel `revendedora`)
- Visual mais enxuto e comercial que o painel interno.
- **Catálogo com preço diferenciado** (só após login), disponibilidade em tempo real, quantidade mínima, kits exclusivos, novidades em destaque.
- Montagem de pedido (carrinho) → pagamento (boleto/Pix/crédito em conta) → acompanhamento (status, rastreio).
- Histórico de pedidos com NF; solicitar troca/devolução.
- Materiais de apoio (fotos, textos, tabela de preço sugerido, guia de cuidados, certificado de garantia).
- Mobile-first de verdade (revendedora usa muito no celular).

### 5.11 Pedidos
- Fila única de todos os canais: status (novo, pago, em separação, embalado, enviado, entregue, cancelado), canal, cliente, valor, data.
- Detalhe do pedido: itens, endereço, rastreio, ações de status.
- Filtros por status/canal/período.

### 5.12 Relatórios
- Vendas (por canal, produto, categoria, período, revendedora; sazonalidade).
- Afiliadas (conversões, ROI, ranking, comissões).
- Financeiro (DRE simplificado, margem por produto, fluxo de caixa, comissões a pagar).
- Exportação **PDF/Excel**. Gráficos Recharts sóbrios.

### 5.13 Mapa
- **MapLibre + OpenStreetMap**, estilo claro minimalista.
- Marcadores de revendedoras/lojas parceiras e pedidos; clusters; popup com resumo ao clicar.

### 5.14 Atendimento / Automação (fase 2)
- Caixa de entrada unificada (WhatsApp/Instagram/TikTok) com histórico do cliente ao lado.
- Marcadores/status da conversa, atribuição a atendente, sugestão de produto por IA.
- Configuração de fluxos automáticos (boas-vindas, pós-compra, reativação, aniversário, carrinho abandonado etc.).

### 5.15 Configurações
- Integrações (Nuvemshop, Evolution), templates de produto, parâmetros configuráveis (limiares de VIP, dias de reativação, estoque mínimo), usuários e papéis, dados da marca/etiqueta.

---

## 6. Checklist por tela (antes de aprovar o design)
- [ ] Versão desktop e versão mobile.
- [ ] Estados: normal, vazio, carregando, erro.
- [ ] Usa os tokens (cores/tipografia/raio/sombra) — sem cor fora da paleta.
- [ ] Cor da marca só em ação/destaque, não em bloco grande.
- [ ] Conteúdo realista de joias (não placeholder genérico).
- [ ] Não parece template de IA (checar a seção 2).
- [ ] Traduzível para shadcn/ui sem gambiarra.
