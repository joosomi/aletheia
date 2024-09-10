import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Invoice } from './entities/invoice.entity';
import { Product } from './entities/product.entity';
import { GrpcAuthGuard } from './guards/grpc-auth.guard';
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
    ClientsModule.registerAsync([
      {
        name: 'AUTH_PACKAGE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'auth',
            protoPath: join(__dirname, 'proto/auth.proto'),
            url: `localhost:${configService.get('AUTH_GRPC_PORT', 50051)}`,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, GrpcAuthGuard],
})
export class OrderModule {}
