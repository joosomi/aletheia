import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthGrpcController } from './auth-grpc.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh.strategy';

import { SharedDatabaseModule } from '@app/shared';
import { LoggerModule } from '@app/shared/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SharedDatabaseModule.forRoot('AUTH'),
    LoggerModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  controllers: [AuthController, AuthGrpcController],
  providers: [AuthService, JwtRefreshGuard, JwtRefreshTokenStrategy, JwtAuthGuard, JwtAuthStrategy],
})
export class AuthModule {}
