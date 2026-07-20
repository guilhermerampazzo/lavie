import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NuvemshopService } from '../nuvemshop/nuvemshop.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';

const TYPE_TO_NUVEMSHOP: Record<string, string> = {
  fixed: 'absolute',
  percentage: 'percentage',
  free_shipping: 'shipping',
};

@Injectable()
export class CouponsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nuvemshop: NuvemshopService,
  ) {}

  list() {
    return this.prisma.client.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async get(id: string) {
    const coupon = await this.prisma.client.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Cupom não encontrado');
    return coupon;
  }

  private buildNuvemshopPayload(dto: CreateCouponDto | UpdateCouponDto, code: string) {
    return {
      code,
      type: TYPE_TO_NUVEMSHOP[dto.type ?? 'fixed'],
      value: dto.value?.toString(),
      max_uses: dto.usageLimit,
      start_date: dto.validFrom,
      end_date: dto.validUntil,
    };
  }

  async create(dto: CreateCouponDto) {
    let nuvemshopCouponId: string | undefined;

    if (this.nuvemshop.configured) {
      const result = await this.nuvemshop.client.coupons.create(
        this.buildNuvemshopPayload(dto, dto.code),
      );
      nuvemshopCouponId = String((result as { id: number | string }).id);
    }

    return this.prisma.client.coupon.create({
      data: {
        code: dto.code,
        type: dto.type,
        value: dto.value,
        usageLimit: dto.usageLimit,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        nuvemshopCouponId,
      },
    });
  }

  async update(id: string, dto: UpdateCouponDto) {
    const existing = await this.get(id);

    if (this.nuvemshop.configured && existing.nuvemshopCouponId) {
      await this.nuvemshop.client.coupons.update(
        existing.nuvemshopCouponId,
        this.buildNuvemshopPayload(dto, dto.code ?? existing.code),
      );
    } else if (this.nuvemshop.configured) {
      throw new BadRequestException('Cupom sem vínculo com a Nuvemshop — recrie o cupom.');
    }

    return this.prisma.client.coupon.update({
      where: { id },
      data: {
        code: dto.code,
        type: dto.type,
        value: dto.value,
        usageLimit: dto.usageLimit,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        active: dto.active,
      },
    });
  }
}
