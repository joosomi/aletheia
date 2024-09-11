import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginatedResponse } from './common/pagination-response.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersDto } from './dto/get-orders.dto';
import { Invoice, OrderType, Status } from './entities/invoice.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  /**
   * 주문 목록 조회
   * @param getOrdersDto
   * @param user
   * @returns
   */
  async getOrders(
    getOrdersDto: GetOrdersDto,
    user: { userId: string; role: string },
  ): Promise<PaginatedResponse<Invoice>> {
    const { date, limit = 10, offset = 0, orderType } = getOrdersDto;

    const query = this.invoiceRepository.createQueryBuilder('invoice');

    // 관리자가 아닌 경우, 자신의 주문만 조회
    if (user.role !== 'ADMIN') {
      query.where('invoice.userId = :userId', { userId: user.userId });
    }

    if (date) {
      query.andWhere('DATE(invoice.createdAt) = :date', { date });
    }

    if (orderType) {
      query.andWhere('invoice.orderType = :orderType', { orderType });
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

  /**
   * 금 주문 상세 조회
   * @param orderId
   * @param user
   * @returns
   */
  async getOrderById(
    orderId: string,
    user: { userId: string; role: string },
  ): Promise<{ success: boolean; message: string; data: Invoice }> {
    const query = this.invoiceRepository.createQueryBuilder('invoice').where('invoice.id = :orderId', { orderId });

    const order = await query.getOne();

    // 주문이 존재하지 않는 경우
    if (!order) {
      throw new NotFoundException('해당 주문을 찾을 수 없습니다.');
    }

    // 관리자가 아닌 경우, 자신의 주문만 조회가 가능함.
    if (user.role !== 'ADMIN' && order.userId !== user.userId) {
      throw new ForbiddenException('해당 주문에 접근할 권한이 없습니다.');
    }

    return {
      success: true,
      message: '주문 조회에 성공했습니다.',
      data: order,
    };
  }

  /**
   * 주문 생성
   * @param createOrderDto
   * @param user
   * @param orderType
   * @returns
   */
  async createOrder(
    createOrderDto: CreateOrderDto,
    user: { userId: string },
    orderType: OrderType,
  ): Promise<{ success: boolean; message: string }> {
    const product = await this.productRepository.findOne({ where: { type: createOrderDto.productType } });
    if (!product) {
      throw new BadRequestException('현재 주문이 불가능한 상품입니다.');
    }

    const price = orderType === OrderType.PURCHASE ? product.purchasePricePerGram : product.salePricePerGram;
    const totalPrice = price * createOrderDto.quantity;

    const orderNumber = this.generateOrderNumber(orderType);

    const newOrder = this.invoiceRepository.create({
      orderNumber,
      orderType,
      status: Status.ORDER_COMPLETED, //주문 완료
      quantity: createOrderDto.quantity,
      price,
      totalPrice,
      deliveryAddress: createOrderDto.deliveryAddress,
      recipientName: createOrderDto.recipientName,
      contactNumber: createOrderDto.contactNumber,
      postalCode: createOrderDto.postalCode,
      product,
      userId: user.userId,
    });

    await this.invoiceRepository.save(newOrder);

    return {
      success: true,
      message: '주문이 완료되었습니다.',
    };
  }

  /**
   * 주문 번호 생성
   * 주문 번호 형식: [주문 유형]-[날짜]-[랜덤 문자]
   * @param orderType
   * @returns 고유한 주문 번호
   */
  private generateOrderNumber(orderType: OrderType): string {
    const date = this.formatDate(new Date());
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    const typePrefix = orderType === OrderType.PURCHASE ? 'PURCHASE' : 'SALE';
    return `${typePrefix}-${date}-${randomPart}`;
  }

  /**
   * 날짜 형식 변환
   * @param date
   * @returns 'YYMMDD' 형식의 문자열
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }
}
