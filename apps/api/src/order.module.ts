import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Invoice } from './entities/invoice.entity';
import { Product } from './entities/product.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

import { SharedDatabaseModule } from '@app/shared';
import { LoggerModule } from '@app/shared/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedDatabaseModule.forRoot('API'),
    LoggerModule,
    TypeOrmModule.forFeature([Invoice, Product]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
