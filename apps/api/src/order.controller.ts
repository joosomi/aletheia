import { Controller, Get, Query, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

import { PaginatedResponse } from './common/pagination-response.dto';
import { GetOrdersDto } from './dto/get-orders.dto';
import { Invoice } from './entities/invoice.entity';
import { OrderService } from './order.service';
@ApiTags('order')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({
    summary: '주문 목록 조회',
    description:
      '페이지네이션이 적용된 주문 목록을 조회합니다. 사용자는 본인의 주문만 조회할 수 있습니다. 관리자는 모든 주문 조회가 가능합니다.',
  })
  @ApiQuery({ name: 'date', required: false, type: String, description: '날짜별 필터링 (YYYY-MM-DD 형식)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '한 페이지당 항목 수' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: '건너뛸 항목 수' })
  @ApiQuery({
    name: 'invoiceType',
    required: false,
    enum: ['PURCHASE', 'SALE'],
    description: '주문 유형별 필터링 (PURCHASE: 구매, SALE: 판매)',
  })
  @ApiBearerAuth('access_token')
  @ApiResponse({ status: 200, description: '주문 목록 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getOrders(@Query() getOrdersDto: GetOrdersDto, @Request() req): Promise<PaginatedResponse<Invoice>> {
    const user = req.user;
    return this.orderService.getOrders(getOrdersDto, user);
  }
}
