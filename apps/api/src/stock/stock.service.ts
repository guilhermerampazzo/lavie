import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockMovementDto } from './dto/stock-movement.dto';

/**
 * Movimentações de estoque (escopofinal.md 6.1): entradas, saídas,
 * consignação, devoluções e ajustes, com log completo por usuário.
 * Cada movimentação atualiza o saldo da variante.
 */
@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { type?: string; variantId?: string; limit?: number }) {
    return this.prisma.client.stockMovement.findMany({
      where: {
        type: params.type as never,
        variantId: params.variantId,
      },
      orderBy: { createdAt: 'desc' },
      take: params.limit ?? 100,
    });
  }

  async listByProduct(productId: string) {
    const product = await this.prisma.client.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    const variantIds = product.variants.map((v) => v.id);
    return this.prisma.client.stockMovement.findMany({
      where: { variantId: { in: variantIds } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  /**
   * Registra movimentação e ajusta o estoque da variante.
   * quantity é sempre positivo; o sinal é derivado do tipo:
   *   entrada/consignacao_retorno/devolucao -> soma
   *   saida/consignacao_saida/ajuste(negativo?) -> subtrai
   * "ajuste" usa reason para indicar o sinal ("-5" para reduzir).
   */
  async create(dto: CreateStockMovementDto, userId?: string) {
    const variant = await this.prisma.client.variant.findUnique({ where: { id: dto.variantId } });
    if (!variant) throw new NotFoundException('Variante não encontrada');

    const addsStock = ['entrada', 'consignacao_retorno', 'devolucao'].includes(dto.type);
    let delta = dto.quantity;
    if (!addsStock) delta = -dto.quantity;
    // ajuste: reason pode conter sinal explícito ex.: "-5" ou "+5"
    if (dto.type === 'ajuste' && dto.reason) {
      const signed = parseInt(dto.reason.replace(/\s/g, ''), 10);
      if (!Number.isNaN(signed) && signed !== 0) delta = signed;
    }

    const newStock = variant.estoque + delta;
    if (newStock < 0) {
      throw new BadRequestException(
        `Estoque insuficiente: variante ${variant.sku} tem ${variant.estoque} un (movimentação de ${delta}).`,
      );
    }

    await this.prisma.client.variant.update({
      where: { id: variant.id },
      data: { estoque: newStock },
    });

    return this.prisma.client.stockMovement.create({
      data: {
        variantId: variant.id,
        productId: variant.productId,
        type: dto.type,
        quantity: delta,
        reason: dto.reason,
        userId,
      },
    });
  }
}
