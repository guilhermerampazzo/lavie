import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortalOrderDto, CreateReturnRequestDto } from './dto/portal-order.dto';

@Injectable()
export class PortalService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureReseller(resellerId?: string | null): string {
    if (!resellerId) {
      throw new ForbiddenException('Usuário não está vinculado a uma revendedora.');
    }
    return resellerId;
  }

  private resellerPrice(
    product: { id: string; precoBase: unknown; precoRevendedora: unknown },
    priceMap: Map<string, number>,
  ): number {
    return (
      priceMap.get(product.id) ??
      (product.precoRevendedora ? Number(product.precoRevendedora) : Number(product.precoBase))
    );
  }

  /** Quantidade mínima por item no catálogo (configurável em Setting). */
  private async minQuantity(): Promise<number> {
    const setting = await this.prisma.client.setting.findUnique({ where: { key: 'portal_min_quantity' } });
    const value = (setting?.value as { value?: number } | undefined)?.value;
    return typeof value === 'number' && value > 0 ? value : 1;
  }

  async catalog(resellerId?: string | null) {
    const id = this.ensureReseller(resellerId);
    const [products, priceTable, minQty, kits] = await Promise.all([
      this.prisma.client.product.findMany({
        where: { status: 'active' },
        include: { variants: true, images: true },
      }),
      this.prisma.client.resellerPriceTable.findMany({ where: { resellerId: id } }),
      this.minQuantity(),
      this.prisma.client.resellerKit.findMany({
        where: { active: true },
        include: { items: { include: { product: { include: { variants: true } } } } },
      }),
    ]);

    const priceMap = new Map(priceTable.map((p) => [p.productId, Number(p.price)]));

    const items = products.map((p) => ({
      id: p.id,
      nome: p.nomeGerado,
      precoVarejo: Number(p.precoBase),
      precoRevenda: this.resellerPrice(p, priceMap),
      variants: p.variants.map((v) => ({ id: v.id, sku: v.sku, estoque: v.estoque })),
    }));

    // Kits exclusivos com desconto adicional (escopofinal.md 7.3)
    const kitItems = kits.map((kit) => {
      let total = 0;
      const productsInKit = kit.items.map((item) => {
        const product = items.find((i) => i.id === item.productId);
        const unitPrice = product?.precoRevenda ?? 0;
        total += unitPrice * item.quantity;
        return {
          productId: item.productId,
          nome: product?.nome ?? 'Produto',
          quantity: item.quantity,
          unitPrice,
        };
      });
      const discount = (Number(kit.discountPct) / 100) * total;
      return {
        id: kit.id,
        name: kit.name,
        description: kit.description,
        discountPct: Number(kit.discountPct),
        total,
        price: total - discount,
        items: productsInKit,
      };
    });

    return { items, minQuantity: minQty, kits: kitItems };
  }

  async orders(resellerId?: string | null) {
    const id = this.ensureReseller(resellerId);
    return this.prisma.client.resellerOrder.findMany({
      where: { resellerId: id },
      include: { order: { include: { items: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createOrder(resellerId: string | null | undefined, dto: CreatePortalOrderDto) {
    const id = this.ensureReseller(resellerId);
    const minQty = await this.minQuantity();

    const variantIds = dto.items.map((i) => i.variantId);
    const productIds = dto.items.map((i) => i.productId);
    const [variants, products, priceTable] = await Promise.all([
      this.prisma.client.variant.findMany({ where: { id: { in: variantIds } } }),
      this.prisma.client.product.findMany({ where: { id: { in: productIds } } }),
      this.prisma.client.resellerPriceTable.findMany({ where: { resellerId: id } }),
    ]);
    if (variants.length !== variantIds.length) {
      throw new BadRequestException('Uma ou mais variantes não foram encontradas.');
    }

    // Quantidade mínima por item
    for (const item of dto.items) {
      if (item.quantity < minQty) {
        throw new BadRequestException(
          `Quantidade mínima por item é ${minQty} — ajuste "${item.productId}" (${item.quantity}).`,
        );
      }
    }

    const priceMap = new Map(priceTable.map((p) => [p.productId, Number(p.price)]));

    let total = 0;
    const itemsData = dto.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      const product = products.find((p) => p.id === item.productId)!;
      const unitPrice = this.resellerPrice(product, priceMap);
      total += unitPrice * item.quantity;
      return {
        productId: item.productId,
        sku: variant.sku,
        name: variant.sku,
        quantity: item.quantity,
        unitPrice,
      };
    });

    const order = await this.prisma.client.order.create({
      data: {
        channel: 'revendedora',
        status: 'novo',
        total,
        items: { create: itemsData },
      },
    });

    return this.prisma.client.resellerOrder.create({
      data: {
        resellerId: id,
        orderId: order.id,
        paymentMethod: dto.paymentMethod,
        paymentStatus: dto.paymentMethod === 'credito_em_conta' ? 'pago' : 'pendente',
      },
      include: { order: { include: { items: true } } },
    });
  }

  /** Solicitação de troca/devolução pelo portal (escopofinal.md 7.4). */
  async createReturn(resellerId: string | null | undefined, dto: CreateReturnRequestDto) {
    const id = this.ensureReseller(resellerId);

    const resellerOrder = await this.prisma.client.resellerOrder.findUnique({
      where: { orderId: dto.orderId },
    });
    if (!resellerOrder || resellerOrder.resellerId !== id) {
      throw new NotFoundException('Pedido não encontrado para esta revendedora.');
    }

    return this.prisma.client.returnRequest.create({
      data: {
        resellerId: id,
        orderId: dto.orderId,
        reason: dto.reason,
        items: dto.items as never,
      },
    });
  }

  /** Materiais de apoio (escopofinal.md 7.5) — biblioteca global de divulgação. */
  async supportMaterials() {
    return this.prisma.client.affiliateMaterial.findMany({
      where: { affiliateId: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async priceTable(resellerId?: string | null) {
    const id = this.ensureReseller(resellerId);
    return this.prisma.client.resellerPriceTable.findMany({ where: { resellerId: id } });
  }
}
