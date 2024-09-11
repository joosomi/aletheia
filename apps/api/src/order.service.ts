import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginatedResponse } from './common/pagination-response.dto';
import { GetOrdersDto } from './dto/get-orders.dto';
import { Invoice } from './entities/invoice.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getOrders(getOrdersDto: GetOrdersDto, user: { id: string; role: string }): Promise<PaginatedResponse<Invoice>> {
    const { date, limit = 10, offset = 0, invoiceType } = getOrdersDto;

    const query = this.invoiceRepository.createQueryBuilder('invoice');

    // 관리자가 아닌 경우, 자신의 주문만 조회
    if (user.role !== 'ADMIN') {
      query.where('invoice.userId = :userId', { userId: user.id });
    }

    if (date) {
      query.andWhere('DATE(invoice.createdAt) = :date', { date });
    }

    if (invoiceType) {
      query.andWhere('invoice.orderType = :invoiceType', { invoiceType });
    }

    const [invoices, total] = await query
      .orderBy('invoice.createdAt', 'DESC') //내림차순
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    const hasNextPage = offset + limit < total;
    const hasPreviousPage = offset > 0;

    return {
      success: true,
      message: '주문 목록 조회에 성공했습니다.',
      data: invoices,
      links: {
        next: hasNextPage ? `/api/orders?limit=${limit}&offset=${offset + limit}` : null,
        previous: hasPreviousPage ? `/api/orders?limit=${limit}&offset=${Math.max(0, offset - limit)}` : null,
      },
    };
  }
}
