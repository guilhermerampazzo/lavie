import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortalOrderDto } from './dto/portal-order.dto';

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
    product: { id: string; precoBase: unknown; precoRevendedora: unknown | null },
    priceMap: Map<string, number>,
  ): number {
    return (
      priceMap.get(product.id) ??
      (product.precoRevendedora ? Number(product.precoRevendedora) : Number(product.precoBase))
    );
  }

  async catalog(resellerId?: string | null) {
    const id = this.ensureReseller(resellerId);
    const [products, priceTable] = await Promise.all([
      this.prisma.client.product.findMany({
        where: { status: 'active' },
        include: { variants: true, images: true },
      }),
      this.prisma.client.resellerPriceTable.findMany({ where: { resellerId: id } }),
    ]);

    const priceMap = new Map(priceTable.map((p) => [p.productId, Number(p.price)]));

    return products.map((p) => ({
      id: p.id,
      nome: p.nomeGerado,
      precoVarejo: Number(p.precoBase),
      precoRevenda: this.resellerPrice(p, priceMap),
      variants: p.variants,
    }));
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
      data: { resellerId: id, orderId: order.id },
      include: { order: { include: { items: true } } },
    });
  }

  async priceTable(resellerId?: string | null) {
    const id = this.ensureReseller(resellerId);
    return this.prisma.client.resellerPriceTable.findMany({ where: { resellerId: id } });
  }
}
