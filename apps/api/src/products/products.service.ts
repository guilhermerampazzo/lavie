import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { renderProduct } from '@lavie/product-template';
import { PrismaService } from '../prisma/prisma.service';
import { NuvemshopService } from '../nuvemshop/nuvemshop.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nuvemshop: NuvemshopService,
  ) {}

  list(params: { status?: string; categoryId?: string; search?: string }) {
    return this.prisma.client.product.findMany({
      where: {
        status: params.status as never,
        categoryId: params.categoryId,
        nomeGerado: params.search ? { contains: params.search, mode: 'insensitive' } : undefined,
      },
      include: { variants: true, images: true, category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const product = await this.prisma.client.product.findUnique({
      where: { id },
      include: { variants: true, images: true, category: true, template: true },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  private async renderFromTemplate(templateId: string, dto: CreateProductDto | UpdateProductDto) {
    const template = await this.prisma.client.productTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new BadRequestException('Template inválido');

    return renderProduct(template, {
      nomePeca: dto.nomePeca!,
      banhoMaterial: dto.banhoMaterial!,
      cor: dto.cor!,
      tamanho: dto.tamanho,
      fecho: dto.fecho,
      hipoalergenico: dto.hipoalergenico ?? true,
    });
  }

  async create(dto: CreateProductDto) {
    const { nome, descricao } = await this.renderFromTemplate(dto.templateId, dto);

    return this.prisma.client.product.create({
      data: {
        templateId: dto.templateId,
        nomePeca: dto.nomePeca,
        banhoMaterial: dto.banhoMaterial,
        cor: dto.cor,
        tamanho: dto.tamanho,
        fecho: dto.fecho,
        hipoalergenico: dto.hipoalergenico,
        categoryId: dto.categoryId,
        precoBase: dto.precoBase,
        precoRevendedora: dto.precoRevendedora,
        precoPromocional: dto.precoPromocional,
        nomeGerado: nome,
        descricaoGerada: descricao,
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
      include: { variants: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.get(id);
    const templateId = dto.templateId ?? existing.templateId;

    let nomeGerado = existing.nomeGerado;
    let descricaoGerada = existing.descricaoGerada;
    if (dto.nomePeca || dto.banhoMaterial || dto.cor || dto.tamanho || dto.fecho || dto.templateId) {
      if (!templateId) {
        throw new BadRequestException(
          'Este produto não usa um template do CRM (foi importado da Nuvemshop) — edite nome/descrição diretamente ou selecione um template.',
        );
      }
      const rendered = await this.renderFromTemplate(templateId, {
        nomePeca: dto.nomePeca ?? existing.nomePeca ?? '',
        banhoMaterial: dto.banhoMaterial ?? existing.banhoMaterial ?? '',
        cor: dto.cor ?? existing.cor ?? '',
        tamanho: dto.tamanho ?? existing.tamanho ?? undefined,
        fecho: dto.fecho ?? existing.fecho ?? undefined,
        hipoalergenico: dto.hipoalergenico ?? existing.hipoalergenico,
        templateId,
        precoBase: dto.precoBase ?? Number(existing.precoBase),
        variants: [],
      });
      nomeGerado = rendered.nome;
      descricaoGerada = rendered.descricao;
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
        categoryId: dto.categoryId,
        precoBase: dto.precoBase,
        precoRevendedora: dto.precoRevendedora,
        precoPromocional: dto.precoPromocional,
        status: dto.status,
        nomeGerado,
        descricaoGerada,
      },
      include: { variants: true },
    });
  }

  async publish(id: string) {
    if (!this.nuvemshop.configured) {
      throw new BadRequestException(
        'Integração com a Nuvemshop não configurada (NUVEMSHOP_STORE_ID/NUVEMSHOP_ACCESS_TOKEN).',
      );
    }

    const product = await this.get(id);

    // A Nuvemshop exige "attributes" (nomes das dimensoes de variacao, ex:
    // Cor/Tamanho) + "values" por variante nessa mesma ordem — sem isso,
    // duas variantes sao tratadas como identicas e a API rejeita com 422
    // "Variant values should not be repeated" (confirmado contra a API real).
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
      include: { variants: true },
    });
  }
}
