import { Body, Controller, Get, Param, Patch, Post, Query, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

import { PaginatedResponse } from './common/pagination-response.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersDto } from './dto/get-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import { Invoice, OrderType } from './entities/invoice.entity';
import { OrderService } from './order.service';
@ApiTags('order')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * 주문 목록 조회
   * @param getOrdersDto
   * @param req
   * @returns
   */
  @Get()
  @ApiOperation({
    summary: '주문 목록 조회 및 페이지네이션',
    description:
      '페이지네이션이 적용된 주문 목록 조회가 가능합니다. 사용자는 본인의 주문만 조회할 수 있습니다. 관리자는 모든 주문 조회가 가능합니다.',
  })
  @ApiQuery({ name: 'date', required: false, type: String, description: '날짜별 필터링 (YYYY-MM-DD 형식)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '한 페이지당 항목 수' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: '건너뛸 항목 수' })
  @ApiQuery({
    name: 'orderType',
    required: false,
    enum: ['PURCHASE', 'SALE'],
    description: '주문 유형별 필터링 (PURCHASE: 구매, SALE: 판매)',
  })
  @ApiBearerAuth('access_token')
  @ApiResponse({ status: 200, description: '주문 목록 조회 성공' })
  @ApiResponse({ status: 400, description: '잘못된 입력 정보' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getOrders(@Query() getOrdersDto: GetOrdersDto, @Request() req): Promise<PaginatedResponse<Invoice>> {
    const user = req.user;
    return this.orderService.getOrders(getOrdersDto, user);
  }

  /**
   * 금 주문 상세 조회
   * @param orderId
   * @param req
   * @returns
   */
  @Get(':orderId')
  @ApiOperation({
    summary: '금 주문 상세 조회',
    description: '주문 ID로 금 주문의 상세 정보를 조회합니다. 사용자는 본인의 주문만 조회할 수 있습니다. ',
  })
  @ApiBearerAuth('access_token')
  @ApiResponse({ status: 200, description: '주문 상세 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '해당 주문에 접근할 권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '해당 주문을 찾을 수 없습니다.' })
  async getOrderById(
    @Param('orderId') orderId: string,
    @Request() req,
  ): Promise<{ success: boolean; message: string; data: Invoice }> {
    const user = req.user;
    return this.orderService.getOrderById(orderId, user);
  }

  /**
   * 금 구매 주문 생성
   * @param createOrderDto
   * @param req
   * @returns
   */
  @Post('purchase')
  @ApiOperation({ summary: '금 구매 주문 생성', description: '새로운 금 구매 주문을 생성합니다.' })
  @ApiResponse({ status: 201, description: '주문 생성 성공' })
  @ApiResponse({ status: 400, description: '잘못된 입력 정보' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiBearerAuth('access_token')
  async createPurchaseOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req,
  ): Promise<{ success: boolean; message: string }> {
    return this.orderService.createOrder(createOrderDto, req.user, OrderType.PURCHASE);
  }

  /**
   * 금 판매 주문 생성
   * @param createOrderDto
   * @param req
   * @returns
   */
  @Post('sale')
  @ApiOperation({ summary: '금 판매 주문 생성', description: '새로운 금 판매 주문을 생성합니다.' })
  @ApiResponse({ status: 201, description: '주문 생성 성공' })
  @ApiResponse({ status: 400, description: '잘못된 입력 정보' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiBearerAuth('access_token')
  async createSaleOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req,
  ): Promise<{ success: boolean; message: string }> {
    return this.orderService.createOrder(createOrderDto, req.user, OrderType.SALE);
  }

  @Patch(':orderId/status')
  @ApiOperation({
    summary: '주문 상태 변경',
    description:
      '주문의 상태를 변경합니다. 관리자는 모든 상태로 변경 가능하며, 일반 사용자는 ORDER_COMPLETED 상태로만 변경 가능합니다.구매 주문에서는 ORDER_COMPLETED에서 PAYMENT_RECEIVED로, PAYMENT_RECEIVED에서 SHIPPED로 전환할 수 있습니다. 판매 주문에서는 ORDER_COMPLETED에서 PAYMENT_SENT, PAYMENT_SENT에서 ITEM_RECEIVED로 전환할 수 있습니다.',
  })
  @ApiBearerAuth('access_token')
  @ApiResponse({ status: 200, description: '주문 상태 변경 성공' })
  @ApiResponse({ status: 400, description: '잘못된 입력 정보 또는 유효하지 않은 상태 변경' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '주문 상태를 변경할 권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '해당 주문을 찾을 수 없습니다.' })
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Request() req,
  ): Promise<{ success: boolean; message: string }> {
    const user = req.user;
    return this.orderService.updateOrderStatus(orderId, updateOrderStatusDto.status, user);
  }
}
