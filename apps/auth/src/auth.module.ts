import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { SharedDatabaseModule } from '@app/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SharedDatabaseModule.forRoot('AUTH'),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
