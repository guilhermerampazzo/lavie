


## ESCOPO DO SISTEMA

## Plataforma Digital La Vie

Joias e Semijoias — Documento de Requisitos e Funcionalidades

## Versão:  1.0 Data:  Junho / 2026
Segmento:  Varejo de Joias e Semijoias Status:  Start Fase 1

Plataforma Digital La Vie  —  Escopo do Sistema  —  Joias e Semijoias


- Visão Geral do Projeto
A Plataforma Digital La Vie é uma solução integrada e personalizada para a gestão completa de
uma operação de joias e semijoias no varejo moderno. O sistema unifica em um único ambiente o
e-commerce, o CRM de clientes, revendedoras e influenciadoras, o ERP operacional, a automação
de marketing e a inteligência de negócios — tudo conectado em tempo real com os principais
canais de venda digitais.


1.1 Objetivos do Sistema
- Automatizar o cadastro de produtos com IA (leitura de fotos e notas fiscais)
- Unificar todos os canais de venda: site via Nuvemshop, marketplaces, Instagram Shop e
TikTok Shop

- Gerenciar clientes finais, afiliadas, influenciadoras e revendedoras em um único CRM
- Integrar com ERP contratado (Bling ou Olist) para controle de estoque, pedidos, logística e
financeiro em tempo real

- Escalar as vendas via portal de revendedoras com catálogo e preços exclusivos
- Automatizar o relacionamento e follow-up com clientes via WhatsApp Business API
- Fornecer dashboards e relatórios para decisão estratégica da gestão

## 1.2 Integrações Previstas
## Campo / Funcionalidade

## Descrição

## Instagram Shop / Meta

Publicação automática de produtos e gestão de pedidos via Meta
## Commerce

TikTok Shop

Sincronização de catálogo e pedidos com a plataforma TikTok Shop

## Mercado Livre

Integração via API para listagem, estoque e pedidos

## Shopee

Sincronização de catálogo, preços e pedidos

## Amazon

Publicação e gestão de pedidos na plataforma Amazon Brasil

## Shein

Integração de catálogo com a plataforma Shein

WhatsApp Business API

Atendimento e automação de marketing via API oficial

## Correios / Melhor Envio

Cálculo de frete, geração de etiquetas e rastreamento

## Antifraude

Análise de risco em pagamentos e pedidos

NF-e (SEFAZ)

Emissão automática de notas fiscais eletrônicas

Bling / Olist (ERP)

Integração com ERP contratado para sincronização de estoque,
pedidos, financeiro e NF-e

## 2. Módulo 1 — Dashboard Executivo
Plataforma Digital La Vie  —  Escopo do Sistema  —  Joias e Semijoias


Painel centralizado com os indicadores mais importantes da operação, atualizado em tempo real.
Permite ao gestor ter visão instantânea do desempenho de vendas, estoque, revendedoras,
influenciadoras e campanhas.


2.1 Métricas de Vendas
## Campo / Funcionalidade

## Descrição

Vendas por canal

Receita separada por: site próprio, Mercado Livre, Shopee, TikTok
Shop, Instagram, revendedoras, físico

Comparativo de períodos

Vendas do dia, semana, mês atual vs. mesmo período anterior com
variação %

Ticket médio

Valor médio de pedido por canal e período

Produtos mais vendidos

Ranking dos itens com maior volume e maior receita no período

Produtos com maior
margem

Identificação dos itens mais lucrativos por categoria

Taxa de conversão

Relação entre visitas no site e pedidos finalizados


2.2 Métricas de Estoque
## Campo / Funcionalidade

## Descrição

Estoque total

Quantidade total de peças disponíveis por categoria e canal

Produtos parados

Itens sem movimentação nos últimos 30/60/90 dias (configurável)

Estoque crítico

Alertas de itens com quantidade abaixo do mínimo definido

Giro de produtos

Velocidade de saída de cada SKU no período

Estoque por localização

Distribuição entre estoque próprio, em consignação e com
revendedoras



2.3 Métricas de Revendedoras e Afiliadas
## Campo / Funcionalidade

## Descrição

Ranking de revendedoras

Top revendedoras por volume de pedidos e receita gerada no mês

Performance de
influenciadoras

Conversões geradas por código ou link de cada influenciadora

ROI de campanhas

Retorno sobre investimento por campanha de marketing e afiliada

Comissões a pagar

Total de comissões geradas e status de pagamento por afiliada

Plataforma Digital La Vie  —  Escopo do Sistema  —  Joias e Semijoias


Alertas em Tempo Real
no Dashboard

✓  Pedidos com
pagamento aprovado
aguardando separação há
mais de X horas
✓  Produtos com estoque
esgotado que ainda
aparecem ativos em
marketplaces
✓  Clientes VIP sem
compra há mais de 60 dias
## (configurável)
✓  Novas revendedoras
cadastradas aguardando
aprovação

- Módulo 2 — Cadastro de Produtos
O produto na plataforma La Vie possui uma ficha única e unificada. Os diferentes métodos de
entrada — foto via IA, PDF, nota fiscal via OCR ou preenchimento manual — alimentam essa
mesma ficha, cada um preenchendo os campos que consegue. Os campos que uma determinada
entrada não conseguir preencher ficam em branco e podem ser completados por outro método ou
manualmente a qualquer momento, sem perder o que já foi preenchido.


3.1 Ficha Unificada do Produto — Todos os Campos
A tabela abaixo lista todos os campos da ficha de produto, indicando a origem do preenchimento
automático e o comportamento esperado de cada campo:


## Campo

## Origem

Comportamento e Observações

## IDENTIFICAÇÃO DO PRODUTO

Nome do produto

## IA

Gerado pela IA a partir da imagem; editável antes da
publicação

SKU / Código interno

## Sistema

Criado automaticamente no cadastro; pode ser
sobrescrito manualmente

## Categoria

## IA

Detectada pelo tipo de peça na imagem (ex: Anéis >
## Solitários)

Tags de busca

## IA

Palavras-chave geradas para SEO e filtros no site;
editáveis

Plataforma Digital La Vie  —  Escopo do Sistema  —  Joias e Semijoias


Descrição / Texto de
venda

## IA

Texto de produto redigido pela IA com base na
imagem; editável

## Imagens

## IA

A própria foto usada no cadastro é salva; novas
imagens podem ser adicionadas

## CARACTERÍSTICAS TÉCNICAS

Tipo de peça

## IA

Anel, brinco, colar, pulseira, pingente, broche etc.

## Material / Composição

## IA

Aço inox, prata 925, ouro 18k, folheado, zircônia —
identificado na imagem; editável

Cor e acabamento

## IA

Dourado, prateado, rosé, ródio etc. — reconhecido
visualmente

## Estilo / Coleção

## IA

Romântico, minimalista, boho, clássico etc.; pode ser
vinculado a uma coleção

Variações (tam. / cor)

## IA

Numerações e cores detectadas na imagem; cada
variação gera um SKU independente

Peso e dimensões

## PDF

Preenchimento automático, necessário para cálculo
automático de frete

Instruções de
conservação

## IA

Sugeridas automaticamente com base no material
identificado; editáveis

## PREÇOS

Preço de custo

## OCR/PDF

Valor unitário extraído automaticamente da nota fiscal
do fornecedor

Preço de venda

## —

Definido manualmente pela gestão; exibido no site e
marketplaces

Preço de revendedora

## —

Definido manualmente; visível apenas para
revendedoras autenticadas no portal

Preço promocional

## —

Opcional; quando preenchido substitui o preço de
venda nos canais selecionados

## ESTOQUE E FORNECEDOR

Quantidade em estoque

## OCR

Quantidade recebida extraída da nota fiscal; ajustável
manualmente

Estoque mínimo

## —

Definido manualmente; dispara alerta automático
quando o saldo ficar abaixo

Nome do fornecedor

## OCR

Extraído do cabeçalho da NF e vinculado ao cadastro
de fornecedores

CNPJ do fornecedor

## OCR

Extraído da NF; vinculado automaticamente ao perfil do
fornecedor

Código do fornecedor

## OCR

Referência do produto na numeração interna do
fornecedor

Data de entrada

OCR / Sis.

Data da nota fiscal quando via OCR; data atual quando
via outros métodos

Plataforma Digital La Vie  —  Escopo do Sistema  —  Joias e Semijoias


## PUBLICAÇÃO E CANAIS DE VENDA

Canais de venda

## —

Selecionado manualmente: site, Mercado Livre,
Shopee, TikTok Shop etc.

Status de publicação

## Sistema

Inicia como "Em revisão"; publicado apenas após
aprovação manual

Detecção de duplicata

## Sistema

O sistema verifica se o produto já existe pelo SKU ou
similaridade; se sim, atualiza estoque e encerra o fluxo

## ETIQUETA

Código de barras / QR

## Sistema

Gerado automaticamente a partir do SKU; impresso
com 1 clique

Quantidade de etiquetas

## OCR / —

Puxada da quantidade da NF quando via OCR;
preenchida manualmente nos demais casos

Template da etiqueta

## Sistema

Modelo visual configurado pela gestão; logo, cores e
layout padronizados


Legenda de origem
IA  —  Preenchido automaticamente pela Inteligência Artificial a partir da foto do produto

OCR  —  Extraído automaticamente da nota fiscal do fornecedor por leitura óptica de caracteres

Sistema  —  Gerado pelo próprio sistema (SKU, status inicial, data de entrada, código de barras)

OCR / Sis.  —  Preenchido via OCR quando há nota fiscal; pelo sistema nos demais casos

—  —  Nenhuma fonte automática disponível — preenchimento manual pela equipe

Importante:  todos os campos são sempre editáveis manualmente, independentemente da origem
do preenchimento automático.


3.2 Formas de Entrada — Como os Dados São Coletados
Os três métodos abaixo são complementares e alimentam a mesma ficha unificada do produto. A
equipe pode usar um único método ou combinar dois deles (ex: entrar uma foto e em seguida
anexar a NF) — os campos já preenchidos são mantidos e os campos em branco são completados
pela segunda fonte.


## Método

O que preenche e como funciona

Foto do
produto (IA)

A equipe fotografa ou importa a imagem da peça. A IA identifica tipo, material,
cor, estilo, tags e sugere nome e descrição. Os campos técnicos e visuais são
preenchidos. Campos de preço, estoque e fornecedor ficam em branco
aguardando complemento.

Nota fiscal
OCR ou PDF

A nota fiscal do fornecedor é importada (digitada ou escaneada). O sistema extrai
automaticamente: nome e CNPJ do fornecedor, código, quantidade e preço de
custo de cada item. Campos visuais e de publicação ficam em branco
aguardando foto ou preenchimento manual.

Plataforma Digital La Vie  —  Escopo do Sistema  —  Joias e Semijoias


## Manual

A equipe preenche os campos diretamente pelo formulário do sistema, campo por
campo. Disponível sempre — inclusive para corrigir ou complementar o que IA e
OCR preencheram. É o método usado também para campos que nenhuma fonte
automática cobre (peso, preço de venda, canais).


3.3 Fluxo Completo de Cadastro — do Recebimento à Publicação
Independentemente de como o produto entra no sistema, ele segue sempre a mesma sequência
até estar disponível para venda e com etiqueta impressa:


1 — Entrada de dados   A equipe inicia o cadastro por foto (IA), nota fiscal (OCR), PDF ou
formulário manual. Os campos são preenchidos pelo método escolhido. Campos em branco
permanecem disponíveis para complemento.
2 — Verificação de duplicata   O sistema verifica automaticamente se o produto já existe
no catálogo (por SKU ou similaridade visual). Se existir: atualiza o estoque e encerra o
fluxo. Se não existir, continua o cadastro.
3 — Complemento manual (se necessário)   Um alerta indica quais campos obrigatórios
ainda estão em branco (ex: preço de venda, peso). A equipe preenche o que falta antes de
avançar. Campos opcionais podem ser completados depois.
4 — Revisão da ficha e da etiqueta   Tela de revisão unificada: a ficha completa do
produto e a prévia da etiqueta aparecem lado a lado. A equipe confirma todos os dados,
edita o que for necessário e define a quantidade de etiquetas.
5 — Impressão da etiqueta   Com 1 clique, as etiquetas são enviadas para a impressora.
O código de barras / QR Code é gerado automaticamente a partir do SKU. A etiqueta inclui:
nome, código, material, preço e logo La Vie.
6 — Aprovação e publicação   Após revisão, a equipe aprova o produto. O sistema
publica simultaneamente em todos os canais selecionados (site Nuvemshop, Instagram
Shop, TikTok Shop, marketplaces) e o estoque entra em sincronização em tempo real.



## 4. Módulo 3 — Plataforma E-commerce
A plataforma de e-commerce da La Vie será construída sobre a Nuvemshop — solução SaaS de
loja virtual com domínio exclusivo, responsiva em desktop e mobile, integrada nativamente ao
sistema central da La Vie para produtos, estoque, pedidos e clientes.




Plataforma Digital La Vie  —  Escopo do Sistema  —  Joias e Semijoias


4.1 Site e Vitrine
## Campo / Funcionalidade

## Descrição

Domínio exclusivo

Site publicado no domínio próprio da La Vie com certificado SSL

Design responsivo

Layout otimizado para celular, tablet e desktop

Vitrine inteligente

Exibição dos mais vendidos de cada categoria, lançamentos e
destaques automáticos

Filtros de busca

Por categoria, material, cor, faixa de preço, tamanho, coleção

Coleções e kits

Agrupamento de produtos em coleções temáticas com estoque
vinculado

Combos e kits

Gestão de kits com desconto, com controle de estoque individual
das peças

Página de produto

Fotos em zoom, descrição, variações, avaliações, itens relacionados

## Wishlist

Clientes podem salvar produtos favoritos para compra futura

SEO nativo

URLs amigáveis, meta tags e dados estruturados para Google
## Shopping


4.2 Checkout e Pagamentos
## Campo / Funcionalidade

## Descrição

## Pix

Geração de QR Code com confirmação automática e
processamento imediato

Cartão de crédito

Parcelamento configurável (até 12x), bandeiras Visa, Master, Elo,
## Amex

Boleto bancário

Emissão com prazo de vencimento configurável

## Sistema Antifraude

Análise de risco integrada em todas as transações online

Cupons de desconto

Criação e controle de cupons por valor fixo, % ou frete grátis

Frete automático

Cálculo em tempo real via Correios e Melhor Envio pelo CEP

Recuperação de carrinho

Notificação automática para clientes que abandonaram o carrinho

- Módulo 4 — CRM Sob Medida
Central completa de gestão de relacionamento, reunindo em um único sistema os clientes finais, as
afiliadas, as influenciadoras e as revendedoras — com histórico completo, segmentação
automática e automações de follow-up.



Plataforma Digital La Vie  —  Escopo do Sistema  —  Joias e Semijoias


5.1 Cadastro de Clientes Finais
## Campo / Funcionalidade

## Descrição

Dados pessoais

Nome, CPF, data de nascimento, telefone, e-mail, endereço

Histórico de compras

Todos os pedidos, canais, valores, datas e produtos adquiridos

Segmento automático

VIP (acima de X compras/R$), Fiel, Novo, A Reativar (sem compra
há 60+ dias)

## Pontuação / Fidelidade

Sistema de pontos acumulados por compra para troca por
benefícios

Canal de origem

Como o cliente chegou: site, marketplace, indicação, Instagram,
TikTok

## Preferências

Tipos de peça preferidos, materiais e faixa de preço — extraídos do
histórico

Grupo VIP

Marcação para inclusão no grupo VIP do WhatsApp

## Aniversário

Disparo automático de mensagem e cupom no dia do aniversário

## Observações

Campo livre para anotações do time de atendimento


5.2 Segmentação Automática de Clientes
Segmentos criados automaticamente pelo sistema

✓  VIP: clientes com X ou mais compras OU com gasto acumulado acima de R$ Y
## (configurável)
✓  Fiel: clientes com histórico ativo nos últimos 90 dias
✓  Novo: primeira compra realizada há menos de 30 dias
✓  A reativar: sem compra há mais de 60 dias e com histórico anterior
✓  Aniversariantes do mês: para campanhas de relacionamento
✓  Carrinhos abandonados: segmento dinâmico para recuperação automática

5.3 Cadastro de Afiliadas e Influenciadoras
## Campo / Funcionalidade

## Descrição

Dados do perfil

Nome, @usuário, canal principal (Instagram, TikTok, YouTube),
seguidores

Link / Código de rastreio

Link UTM exclusivo ou cupom de desconto para rastreamento de
vendas

Comissão configurada

Percentual ou valor fixo por venda gerada, por campanha ou padrão

Plataforma Digital La Vie  —  Escopo do Sistema  —  Joias e Semijoias


## Status

Ativa, em análise, pausada, inativa

Histórico de campanhas

Campanhas em que participou, produtos promovidos e resultados

Conversões e receita

Total de vendas geradas, receita e ROI calculados automaticamente

Comissões a receber

Saldo de comissões acumuladas com status: pendente, aprovado,
pago

Ranking mensal

Posição no ranking geral de influenciadoras pelo volume de vendas
do mês

Material de divulgação

Biblioteca de imagens e textos prontos para uso pelas afiliadas


5.4 Cadastro de Revendedoras e Lojas Parceiras
## Campo / Funcionalidade

## Descrição

Dados da revendedora

Nome, CNPJ/CPF, endereço, telefone, responsável

Tipo de parceria

Revendedora autônoma, loja física parceira, consignação

Tabela de preços

Preço de revendedor vinculado à conta (diferente do preço público)

Pedidos realizados

Histórico completo de pedidos com datas, valores e status

Estoque consignado

Controle de peças enviadas em consignação com status de retorno
ou venda

Saldo e comissões

Créditos disponíveis e histórico financeiro da parceria

Desempenho mensal

Volume vendido, receita gerada e ranking entre revendedoras

## Documentos

Upload de contrato, CNPJ, comprovantes — armazenados no perfil

Status da conta

Ativa, em análise, bloqueada, inativa


5.5 Automações de Follow-up e Marketing
Fluxos automáticos via WhatsApp Business API e e-mail:
- Pós-compra: mensagem de confirmação + link de rastreio + agradecimento personalizado
- Reativação: para clientes sem compra há 60 dias — oferta exclusiva ou novidade da
coleção

- Aniversário: mensagem personalizada + cupom de desconto exclusivo no dia
- Carrinho abandonado: lembrete em 1h, 24h e 48h com link direto para o produto
- Lançamento de coleção: disparo segmentado por preferência de estilo do cliente
- Grupo VIP: Novidades exclusivas e lançamentos de coleção
- Cashback / pontos: aviso ao cliente quando acumula saldo para resgate
- Módulo 5 — Integração com ERP (Bling / Olist)
Plataforma Digital La Vie  —  Escopo do Sistema  —  Joias e Semijoias


Módulo operacional que unifica controle de estoque, gestão de pedidos, financeiro, emissão de
notas fiscais e logística em um único painel — sincronizado em tempo real com todos os canais de
venda.


6.1 Controle de Estoque
## Campo / Funcionalidade

## Descrição

Estoque unificado

Saldo único sincronizado automaticamente com site, marketplaces e
PDV físico

## Movimentações

Entradas (compras de fornecedor), saídas (vendas, consignações,
devoluções)

Estoque por variação

Controle individual por tamanho, cor e acabamento de cada SKU

Estoque mínimo e máximo

Alertas automáticos quando o saldo sair da faixa configurada

Histórico de movimentações

Log completo de todas as entradas e saídas com usuário
responsável

## Inventário

Ferramenta de contagem física com conciliação contra o sistema

Produtos consignados

Rastreamento de peças em poder de revendedoras com prazo de
retorno


6.2 Gestão de Pedidos
## Campo / Funcionalidade

## Descrição

Centralização de pedidos

Todos os pedidos de todos os canais em uma única fila de
separação

Status do pedido

Novo, pagamento aprovado, em separação, embalado, enviado,
entregue, cancelado

Separação e embalagem

Checklist de separação por pedido com confirmação item a item

Etiqueta de envio

Geração automática via Correios ou Melhor Envio com rastreamento
vinculado

Emissão de NF-e

Nota fiscal eletrônica emitida automaticamente ao aprovar envio

## Rastreamento

Atualização automática de status de entrega com notificação ao
cliente

Devoluções e trocas

Fluxo de troca/devolução com geração de NF de entrada e
reposição de estoque

Relatório de giro

Análise de velocidade de saída por produto, período e canal


## 6.3 Gestão Financeira
Plataforma Digital La Vie  —  Escopo do Sistema  —  Joias e Semijoias


## Campo / Funcionalidade

## Descrição

Receitas por canal

Faturamento separado por: site, ML, Shopee, TikTok, revendedoras,
físico

Contas a receber

Parcelas de cartão, boletos, pagamentos de revendedoras — com
vencimentos

Contas a pagar

Fornecedores, comissões de marketplaces, afiliadas, despesas
operacionais

Fluxo de caixa

Projeção de entradas e saídas por período, com saldo previsto

Emissão de boletos

Geração de boletos para revendedoras e parceiros

Notas de fornecedores

Registro e histórico de NFs de compra para controle de custo e
estoque

Relatórios mensais

DRE simplificado, margem por produto/canal, custos e comissões

- Módulo 6 — Portal de Revendedoras e Lojas Parceiras
Ambiente exclusivo dentro do site onde revendedoras credenciadas podem navegar pelo catálogo
com preços diferenciados, montar pedidos, acompanhar histórico e acessar materiais de venda —
tudo sem depender de atendimento manual.


7.1 Página “Seja uma Revendedora La Vie” no Site
- Acesso via login e senha exclusivos, criados pela equipe La Vie após aprovação do
cadastro da revendedora

- Área protegida por login dentro do CRM — invisível para clientes finais não autenticados
- Cadastro iniciado pela própria revendedora via fluxo de interesse no site (ver seção 7.2 —
Fluxo de Captação)


7.2 Fluxo de Captação de Novas Revendedoras
A captação de novas revendedoras acontece de forma automatizada, partindo de uma aba
exclusiva no site Nuvemshop. O fluxo é dividido em dois caminhos: quem já é revendedora faz
login direto; quem ainda não é passa por um processo guiado de interesse, recebimento de
informações e cadastro.


Fluxo completo — Aba “Seja uma Revendedora La Vie” no site Nuvemshop

✓  Caminho 1 — Já sou revendedora: A página exibe um campo de login e senha. A
revendedora insere suas credenciais e acessa diretamente a área exclusiva com catálogo e
pedidos.
Plataforma Digital La Vie  —  Escopo do Sistema  —  Joias e Semijoias


✓  Caminho 2 — Quero ser revendedora (Passo 1): A página exibe um botão "Saiba
como se tornar uma revendedora La Vie". Ao clicar, a visitante preenche um formulário
simples com nome e e-mail para receber as informações.
✓  Passo 2 — A equipe La Vie encaminha um e-mail com PDF: Um e-mail com um PDF
completo explicando o programa de revendedoras La Vie. O PDF contém: tabela de preços
para revendedoras, quantidade mínima obrigatória por pedido, formas de pagamento aceitas,
política de entrega e troca, e todas as informações necessárias para a decisão de ingresso.
✓  Passo 3 — Manifestação de interesse: Após ler o PDF e decidir fazer parte, a
interessada responde ao e-mail com seus dados de cadastro: nome completo, CPF ou
CNPJ, endereço, telefone, cidade e estado.
✓  Passo 4 — Criação do cadastro pela equipe La Vie: A equipe La Vie valida os dados
recebidos, cria o perfil da revendedora no sistema com a tabela de preços correspondente ao
seu nível de acesso.
✓  Passo 5 — Recebimento do acesso e primeiro login: A nova revendedora recebe um
e-mail de boas-vindas com seu login e senha. Ao acessar o portal, já visualiza os preços
diferenciados do catálogo e pode realizar seu primeiro pedido.

## 7.3 Catálogo Exclusivo
## Campo / Funcionalidade

## Descrição

Preços diferenciados

Tabela de preços de revendedor — diferente do preço público —
visível somente após login

Quantidade mínima

Exibição dos produtos disponíveis a partir de X peças por item
## (configurável)

Disponibilidade em tempo
real

Estoque atualizado instantaneamente — revendedora vê apenas o
que há disponível

Filtros de catálogo

Por categoria, novidade, mais vendido, promoção para revendedor

Kits exclusivos

Combinações de peças montadas especialmente para revendedores
com desconto adicional

Novidades em destaque

Banner com lançamentos e coleções novas para revendedoras


7.4 Pedidos e Logística
- Revendedora seleciona os produtos e quantidades direto no portal e finaliza o pedido
- Opções de pagamento: boleto, Pix, transferência, crédito em conta no sistema
- Cálculo de frete automático com entrega no endereço cadastrado da revendedora
- Acompanhamento de pedidos em tempo real: status, código de rastreio e previsão de
entrega

- Histórico completo de pedidos com nota fiscal de cada remessa
- Solicitação de troca ou devolução diretamente pelo portal
Plataforma Digital La Vie  —  Escopo do Sistema  —  Joias e Semijoias



7.5 Materiais de Apoio às Vendas
- Biblioteca de fotos profissionais de cada produto para uso nas redes sociais
- Sugestões de legenda e texto de vendas para cada peça
- Tabela de preços sugeridos para venda ao consumidor final
- Guia de cuidados com as peças para repasse ao cliente
- Certificados de garantia para impressão ou envio digital
- Módulo 7 — Automação e Atendimento
Integração com WhatsApp Business API ou API não oficial, Direct do Instagram para centralizar o
atendimento, automatizar respostas e oferecer sugestões personalizadas de produtos ao cliente —
mantendo um toque humano em toda a comunicação.


## 8.1 Atendimento Centralizado
## Campo / Funcionalidade

## Descrição

Caixa de entrada unificada

Mensagens do WhatsApp, Instagram Direct e TikTok reunidas em
um único painel

Histórico do cliente

Ao abrir uma conversa, o atendente vê o histórico de compras e
perfil do cliente

Identificação automática

Sistema reconhece o número/conta e abre a ficha do cliente
automaticamente

Atribuição de atendimento

Conversa pode ser atribuída a um atendente específico da equipe

Marcadores e status

Marcar conversa como: aguardando resposta, em atendimento,
resolvida, follow-up

Respostas humanizadas

IA entende os produtos e tudo sobre a La Vie e responde clientes
em conversa humanizada sobre produtos, frete, troca, qualidade

Transferência de conversa

Passar atendimento para outro membro da equipe com histórico
preservado


8.2 Sugestão de Produtos por IA
- Durante o atendimento, a IA sugere produtos relevantes com base no histórico do cliente e
no que ele descreveu

- Atendente pode inserir o link do produto diretamente na conversa com um clique
- Sugestão de combinações de peças: 'quem comprou X também gostou de Y'
- Para revendedoras: sugestão dos itens com maior giro e margem no momento

Plataforma Digital La Vie  —  Escopo do Sistema  —  Joias e Semijoias


8.3 Automações de Marketing
## Campo / Funcionalidade

## Descrição

## Boas-vindas

Mensagem automática no primeiro contato com o número da La Vie

Confirmação de pedido

Detalhes do pedido + previsão de envio logo após a compra

Notificação de envio

Código de rastreio e link de acompanhamento quando o pedido sai

Avaliação pós-entrega

Pedido de avaliação e foto do produto sendo usado

## Reativação

Oferta segmentada para clientes inativos com base no histórico de
preferências

## Aniversário

Mensagem + cupom personalizado no dia do aniversário

Lançamento de coleção

Disparo para clientes segmentados por estilo e faixa de valor

Alerta de estoque

Aviso para clientes que marcaram produto na wishlist quando o item
estiver de volta

- Módulo 8 — Integrações com Marketplaces e Canais
Sincronização bidirecional com todos os principais canais de venda — produtos, preços, estoque e
pedidos atualizados automaticamente, sem necessidade de gestão manual por canal.


## Campo / Funcionalidade

## Descrição

Sincronização de catálogo

Produto cadastrado na La Vie publicado automaticamente nos
canais selecionados

Atualização de estoque

Quando uma venda ocorre em qualquer canal, o estoque é deduzido
em todos simultaneamente

Gestão de preços

Tabela de preços diferenciada por canal (ex.: preço no ML pode ser
diferente do site)

Centralização de pedidos

Pedidos de todos os canais entram na mesma fila do ERP para
separação

Respostas a perguntas

Dúvidas de compradores nos marketplaces aparecem na caixa de
atendimento unificada

Métricas por canal

Faturamento, conversão e performance de cada marketplace no
dashboard


Canais de Venda Integrados

✓  Site próprio La Vie (e-commerce nativo)
✓  Instagram Shop / Meta Commerce — catálogo vinculado ao perfil do Instagram
✓  TikTok Shop — listagem e gestão de pedidos diretamente da plataforma
Plataforma Digital La Vie  —  Escopo do Sistema  —  Joias e Semijoias


✓  Mercado Livre — listagem, perguntas, pedidos e reputação
✓  Shopee — catálogo, pedidos e avaliações
✓  Amazon Brasil — listagem e gestão de pedidos
✓  Shein — sincronização de catálogo
- Módulo 9 — Analytics e Relatórios
Camada de inteligência de negócios que transforma os dados operacionais em insights acionáveis
para a gestão da La Vie. Relatórios automáticos e dashboards interativos disponíveis a qualquer
hora.


10.1 Relatórios de Vendas
## Campo / Funcionalidade

## Descrição

Vendas por canal

Faturamento, quantidade e ticket médio separados por canal de
venda

Vendas por produto

Ranking de itens por receita, volume e margem de lucro

Vendas por categoria

Performance comparativa entre anéis, brincos, colares, pulseiras
etc.

Vendas por período

Diário, semanal, mensal, semestral e anual com gráficos
comparativos

Vendas por revendedora

Contribuição individual de cada revendedora ao faturamento total

## Sazonalidade

Identificação de picos de venda por período (Dia das Mães, Natal,
etc.)


10.2 Relatórios de Afiliadas e Influenciadoras
## Campo / Funcionalidade

## Descrição

Conversões por afiliada

Número de cliques, pedidos gerados e receita por link ou cupom

ROI de campanhas

Retorno sobre o investimento em cada campanha de divulgação

Ranking mensal

Top influenciadoras do mês com premiação configurável

Comissões geradas

Total a pagar por afiliada com detalhamento por pedido

Comparativo de canais

Instagram vs. TikTok vs. outras plataformas em performance de
afiliadas


## 10.3 Relatórios Financeiros
Plataforma Digital La Vie  —  Escopo do Sistema  —  Joias e Semijoias


## Campo / Funcionalidade

## Descrição

DRE Simplificado

Receitas, custos, comissões, despesas e lucro líquido por período

Margem por produto

Custo vs. preço de venda de cada SKU com margem percentual

Fluxo de caixa

Entradas e saídas previstas e realizadas por semana/mês

Conciliação bancária

Conferência entre os valores no sistema e os extratos bancários

Comissões a pagar

Detalhamento de todas as comissões de afiliadas e revendedoras
por período


## 10.4 Relatórios Automáticos
- Relatório semanal por e-mail para a gestão: resumo de vendas, estoque crítico e pedidos
pendentes

- Relatório mensal completo: faturamento por canal, ranking de produtos, performance de
revendedoras e afiliadas

- Relatório semestral: análise de tendências, sazonalidade e projeção de demanda
- Relatório anual: visão consolidada do ano com comparativo e evolução
- Todos os relatórios exportáveis em PDF e Excel para apresentação ou análise externa
- Resumo dos Módulos do Sistema

## #

## Módulo

## Principais Funcionalidades

## 1

## Dashboard Executivo

Vendas por canal, estoque, afiliadas, alertas em tempo real

## 2

Cadastro Inteligente de
## Produtos

IA por imagem, OCR de NF, ficha completa, revisão e
publicação multi-canal

## 3

## Plataforma E-commerce

Site próprio, vitrine, checkout, cupons, frete automático,
antifraude

## 4

CRM Sob Medida

Clientes finais, afiliadas, influenciadoras, revendedoras,
follow-up automático

## 5

Integração ERP (Bling/Olist)

Integração com Bling ou Olist: estoque, pedidos, NF-e,
logística, financeiro

## 6

Portal de Revendedoras

Catálogo exclusivo, preços diferenciados, pedidos, materiais
de apoio

## 7

Automação e Atendimento

Caixa unificada, IA de sugestão de produtos, campanhas
automatizadas

## 8

Integrações com Canais

Meta/IG Shop, TikTok Shop, ML, Shopee, Amazon, Shein —
sincronização total

## 9

Analytics e Relatórios

Vendas, financeiro, afiliadas, relatórios automáticos
semanais/mensais/anuais

Plataforma Digital La Vie  —  Escopo do Sistema  —  Joias e Semijoias




Nota: Este documento é um escopo vivo. Ajustes, inclusões ou priorizações de módulos podem
ser acordados entre as partes antes do início do desenvolvimento.

Plataforma Digital La Vie  —  Escopo do Sistema  —  Joias e Semijoias
