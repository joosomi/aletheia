import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ApiController } from './api.controller';
import { ApiService } from './api.service';

import { SharedDatabaseModule } from '@app/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedDatabaseModule.forRoot('API'),
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
