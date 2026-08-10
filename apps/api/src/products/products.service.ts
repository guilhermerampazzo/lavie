import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { renderProduct } from '@lavie/product-template';
import { AiService } from '@lavie/ai';
import { PrismaService } from '../prisma/prisma.service';
import { NuvemshopService } from '../nuvemshop/nuvemshop.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import {
  AnalyzeImageDto,
  CreateProductDto,
  ExtractInvoiceDto,
  UpdateProductDto,
} from './dto/product.dto';

/** Normaliza texto para busca de duplicata (sem acentos, minúsculas). */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Gera SKU interno: prefixo do tipo + timestamp curto (ex.: PUL-2K8F9). */
function generateSku(tipoPeca?: string | null): string {
  const map: Record<string, string> = {
    anel: 'ANE',
    brinco: 'BRI',
    colar: 'COL',
    pulseira: 'PUL',
    pingente: 'PIN',
    broche: 'BRO',
    outro: 'PEC',
  };
  const prefix = (tipoPeca ? map[tipoPeca.toLowerCase()] : undefined) ?? 'PEC';
  const suffix = Date.now().toString(36).slice(-4).toUpperCase();
  return `${prefix}-${suffix}`;
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nuvemshop: NuvemshopService,
    private readonly ai: AiService,
    private readonly suppliers: SuppliersService,
  ) {}

  list(params: { status?: string; categoryId?: string; search?: string; supplierId?: string }) {
    return this.prisma.client.product.findMany({
      where: {
        status: params.status as never,
        categoryId: params.categoryId,
        supplierId: params.supplierId,
        OR: params.search
          ? [
              { nomeGerado: { contains: params.search, mode: 'insensitive' } },
              { skuInterno: { contains: params.search, mode: 'insensitive' } },
              { tags: { has: params.search } },
            ]
          : undefined,
      },
      include: { variants: true, images: true, category: true, supplier: true, canais: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const product = await this.prisma.client.product.findUnique({
      where: { id },
      include: {
        variants: true,
        images: true,
        category: true,
        template: true,
        supplier: true,
        canais: true,
      },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  /**
   * Detecção de duplicata (escopofinal.md 3.3 passo 2): verifica por SKU
   * interno exato ou similaridade de nome. Retorna o produto candidato.
   */
  async findDuplicate(input: { skuInterno?: string; nome?: string }): Promise<{
    duplicate: boolean;
    product?: { id: string; nomeGerado: string; skuInterno: string | null };
    reason?: 'sku' | 'nome';
  }> {
    if (input.skuInterno) {
      const bySku = await this.prisma.client.product.findUnique({
        where: { skuInterno: input.skuInterno },
        select: { id: true, nomeGerado: true, skuInterno: true },
      });
      if (bySku) return { duplicate: true, product: bySku, reason: 'sku' };
    }

    if (input.nome) {
      const target = normalize(input.nome);
      const candidates = await this.prisma.client.product.findMany({
        select: { id: true, nomeGerado: true, skuInterno: true },
      });
      for (const c of candidates) {
        const cand = normalize(c.nomeGerado);
        // similaridade por palavras em comum
        const targetWords = new Set(target.split(' ').filter((w) => w.length > 2));
        const candWords = new Set(cand.split(' ').filter((w) => w.length > 2));
        if (targetWords.size === 0 || candWords.size === 0) continue;
        let common = 0;
        for (const w of targetWords) if (candWords.has(w)) common++;
        const ratio = common / Math.max(targetWords.size, candWords.size);
        if (ratio >= 0.6) return { duplicate: true, product: c, reason: 'nome' };
      }
    }

    return { duplicate: false };
  }

  private async renderFromTemplate(templateId: string | undefined, dto: CreateProductDto | UpdateProductDto) {
    if (!templateId) return null;
    const template = await this.prisma.client.productTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new BadRequestException('Template inválido');

    return renderProduct(template, {
      nomePeca: dto.nomePeca ?? '',
      banhoMaterial: dto.banhoMaterial ?? '',
      cor: dto.cor ?? '',
      tamanho: dto.tamanho,
      fecho: dto.fecho,
      hipoalergenico: dto.hipoalergenico ?? true,
    });
  }

  async create(dto: CreateProductDto) {
    // Duplicata por SKU interno
    if (dto.skuInterno) {
      const dup = await this.findDuplicate({ skuInterno: dto.skuInterno });
      if (dup.duplicate) {
        throw new BadRequestException(
          `Produto duplicado: já existe "${dup.product?.nomeGerado}" com o SKU ${dto.skuInterno}.`,
        );
      }
    }

    const rendered = await this.renderFromTemplate(dto.templateId, dto);
    const nomeGerado = rendered?.nome ?? dto.nomePeca ?? dto.descricaoSugerida?.slice(0, 80) ?? 'Produto sem nome';
    const descricaoGerada =
      rendered?.descricao ?? dto.descricaoSugerida ?? '';

    // Duplicata por nome (aviso, não bloqueia — escopo: "se existir, atualiza estoque e encerra")
    const dupByName = await this.findDuplicate({ nome: nomeGerado });
    if (dupByName.duplicate && dupByName.reason === 'nome') {
      // Encerra o fluxo de criação informando o produto existente
      throw new BadRequestException(
        `Produto semelhante já cadastrado: "${dupByName.product?.nomeGerado}". Revise ou atualize o estoque do produto existente.`,
      );
    }

    const skuInterno = dto.skuInterno ?? generateSku(dto.tipoPeca);

    // Se veio do OCR e há fornecedor, cria/atualiza fornecedor
    let supplierId = dto.supplierId;
    if (dto.dataEntrada && dto.supplierId) {
      // supplierId explícito já basta
    }

    return this.prisma.client.product.create({
      data: {
        templateId: dto.templateId,
        nomePeca: dto.nomePeca,
        banhoMaterial: dto.banhoMaterial,
        cor: dto.cor,
        tamanho: dto.tamanho,
        fecho: dto.fecho,
        hipoalergenico: dto.hipoalergenico,
        skuInterno,
        tags: dto.tags,
        tipoPeca: dto.tipoPeca,
        material: dto.material,
        corAcabamento: dto.corAcabamento,
        estilo: dto.estilo,
        colecao: dto.colecao,
        instrucoesConservacao: dto.instrucoesConservacao,
        precoCusto: dto.precoCusto,
        precoBase: dto.precoBase ?? 0,
        precoRevendedora: dto.precoRevendedora,
        precoPromocional: dto.precoPromocional,
        estoqueMinimo: dto.estoqueMinimo,
        pesoGramas: dto.pesoGramas,
        dimensoes: dto.dimensoes,
        dataEntrada: dto.dataEntrada ? new Date(dto.dataEntrada) : undefined,
        supplierId,
        categoryId: dto.categoryId,
        status: 'em_revisao',
        nomeGerado,
        descricaoGerada,
        canais: { create: dto.canais.map((channel) => ({ channel })) },
        variants: {
          create: dto.variants.map((v) => ({
            sku: v.sku,
            cor: v.cor,
            tamanho: v.tamanho,
            banho: v.banho,
            preco: v.preco,
            estoque: v.estoque,
          })),
        },
      },
      include: { variants: true, canais: true, supplier: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.get(id);
    const templateId = dto.templateId ?? existing.templateId;

    let nomeGerado = existing.nomeGerado;
    let descricaoGerada = existing.descricaoGerada;
    if (dto.nomePeca || dto.banhoMaterial || dto.cor || dto.tamanho || dto.fecho || dto.templateId) {
      const rendered = await this.renderFromTemplate(templateId ?? undefined, {
        nomePeca: dto.nomePeca ?? existing.nomePeca ?? '',
        banhoMaterial: dto.banhoMaterial ?? existing.banhoMaterial ?? '',
        cor: dto.cor ?? existing.cor ?? '',
        tamanho: dto.tamanho ?? existing.tamanho ?? undefined,
        fecho: dto.fecho ?? existing.fecho ?? undefined,
        hipoalergenico: dto.hipoalergenico ?? existing.hipoalergenico,
      } as UpdateProductDto);
      if (rendered) {
        nomeGerado = rendered.nome;
        descricaoGerada = rendered.descricao;
      } else {
        // Sem template: usa texto direto
        if (dto.nomePeca) nomeGerado = dto.nomePeca;
        if (dto.descricaoSugerida) descricaoGerada = dto.descricaoSugerida;
      }
    }

    // SKU interno: não deixar duplicar
    if (dto.skuInterno && dto.skuInterno !== existing.skuInterno) {
      const dup = await this.findDuplicate({ skuInterno: dto.skuInterno });
      if (dup.duplicate && dup.product?.id !== id) {
        throw new BadRequestException(
          `Já existe outro produto com o SKU ${dto.skuInterno} ("${dup.product?.nomeGerado}").`,
        );
      }
    }

    return this.prisma.client.product.update({
      where: { id },
      data: {
        templateId: dto.templateId,
        nomePeca: dto.nomePeca,
        banhoMaterial: dto.banhoMaterial,
        cor: dto.cor,
        tamanho: dto.tamanho,
        fecho: dto.fecho,
        hipoalergenico: dto.hipoalergenico,
        skuInterno: dto.skuInterno,
        tags: dto.tags,
        tipoPeca: dto.tipoPeca,
        material: dto.material,
        corAcabamento: dto.corAcabamento,
        estilo: dto.estilo,
        colecao: dto.colecao,
        instrucoesConservacao: dto.instrucoesConservacao,
        precoCusto: dto.precoCusto,
        precoBase: dto.precoBase,
        precoRevendedora: dto.precoRevendedora,
        precoPromocional: dto.precoPromocional,
        estoqueMinimo: dto.estoqueMinimo,
        pesoGramas: dto.pesoGramas,
        dimensoes: dto.dimensoes,
        dataEntrada: dto.dataEntrada ? new Date(dto.dataEntrada) : undefined,
        supplierId: dto.supplierId,
        categoryId: dto.categoryId,
        status: dto.status,
        nomeGerado,
        descricaoGerada,
      },
      include: { variants: true, canais: true },
    });
  }

  /**
   * Analisa a foto de uma peça com IA e retorna a ficha sugerida.
   * (escopofinal.md 3.2 — entrada por foto)
   */
  async analyzeImage(dto: AnalyzeImageDto) {
    if (!this.ai.configured) {
      throw new BadRequestException(
        'IA não configurada — preencha AI_API_KEY (ou OPENCODE_GO_API_KEY) e AI_MODEL no .env.',
      );
    }
    return this.ai.analyzeProductImage(dto.image, dto.mime);
  }

  /**
   * Extrai fornecedor + itens de uma nota fiscal com IA.
   * (escopofinal.md 3.2 — entrada por NF/OCR)
   */
  async extractInvoice(dto: ExtractInvoiceDto) {
    if (!this.ai.configured) {
      throw new BadRequestException(
        'IA não configurada — preencha AI_API_KEY (ou OPENCODE_GO_API_KEY) e AI_MODEL no .env.',
      );
    }
    const extraction = await this.ai.extractInvoice(dto.image, dto.mime);

    // Se a IA identificou fornecedor com CNPJ, já resolve/registra o fornecedor
    let supplierId: string | null = null;
    if (extraction.fornecedor?.document) {
      const supplier = await this.suppliers.upsertByDocument({
        name: extraction.fornecedor.name ?? 'Fornecedor não identificado',
        document: extraction.fornecedor.document,
        code: extraction.fornecedor.code ?? undefined,
        phone: extraction.fornecedor.phone ?? undefined,
      });
      supplierId = supplier.id;
    }

    return { ...extraction, supplierId };
  }

  async publish(id: string) {
    if (!this.nuvemshop.configured) {
      throw new BadRequestException(
        'Integração com a Nuvemshop não configurada (NUVEMSHOP_STORE_ID/NUVEMSHOP_ACCESS_TOKEN).',
      );
    }

    const product = await this.get(id);

    const attributeFields = (['cor', 'tamanho', 'banho'] as const).filter((field) =>
      product.variants.some((v) => v[field]),
    );
    const attributeLabels: Record<(typeof attributeFields)[number], string> = {
      cor: 'Cor',
      tamanho: 'Tamanho',
      banho: 'Banho',
    };

    const payload = {
      name: { pt: product.nomeGerado },
      description: { pt: product.descricaoGerada },
      attributes: attributeFields.map((field) => ({ pt: attributeLabels[field] })),
      variants: product.variants.map((v) => ({
        sku: v.sku,
        price: v.preco.toString(),
        stock_management: true,
        stock: v.estoque,
        values: attributeFields.map((field) => ({ pt: v[field] || '-' })),
      })),
      categories: product.categoryId && product.category?.nuvemshopCategoryId
        ? [Number(product.category.nuvemshopCategoryId)]
        : undefined,
    };

    const result = product.nuvemshopProductId
      ? await this.nuvemshop.client.products.update(product.nuvemshopProductId, payload)
      : await this.nuvemshop.client.products.create(payload);

    const nuvemshopProductId = String((result as { id: number | string }).id);

    return this.prisma.client.product.update({
      where: { id },
      data: { nuvemshopProductId, status: 'active' },
      include: { variants: true, canais: true },
    });
  }

  /**
   * Dados para geração de etiqueta (escopofinal.md 3.3 passo 5): nome, SKU,
   * material, preço, código de barras (derivado do SKU) e logo.
   */
  async labelData(id: string) {
    const product = await this.get(id);
    const barcode = product.skuInterno ?? product.variants[0]?.sku ?? product.id.slice(-8);
    return {
      id: product.id,
      nome: product.nomeGerado,
      sku: barcode,
      material: product.material ?? product.banhoMaterial ?? null,
      preco: product.precoBase.toString(),
      precoPromocional: product.precoPromocional?.toString() ?? null,
      tipoPeca: product.tipoPeca,
      codigoBarras: barcode,
    };
  }

  /** Aprova produto para revisão/publicação (transição em_revisao -> active). */
  async approve(id: string) {
    await this.get(id);
    return this.prisma.client.product.update({
      where: { id },
      data: { status: 'active' },
      include: { variants: true },
    });
  }
}
