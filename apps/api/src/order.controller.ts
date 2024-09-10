import { Controller, Get, UseGuards } from '@nestjs/common';

import { GrpcAuthGuard } from './guards/grpc-auth.guard';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('test-auth')
  @UseGuards(GrpcAuthGuard)
  async testAuth() {
    return { message: 'Authenticated successfully via gRPC' };
  }
}
