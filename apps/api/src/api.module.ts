import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { Invoice } from './entities/invoice.entity';
import { Product } from './entities/product.entity';

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
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
