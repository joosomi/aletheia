import { join } from 'path';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AuthModule } from './auth.module';

import { GlobalExceptionFilter } from '@app/shared/filters/global-exception.filter';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AuthModule);
  const configService = app.get(ConfigService);

  // gRPC 마이크로서비스 설정
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, 'proto/auth.proto'),
      url: `localhost:${configService.get('AUTH_GRPC_PORT', 50051)}`,
    },
  });

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  app.useLogger(logger);

  // Global Validation Pipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 정의되지 않은 프로퍼티 제거
      forbidNonWhitelisted: true, // 정의되지 않은 프로퍼티가 있으면 에러 반환
      transform: true, // 요청 데이터를 자동으로 변환
    }),
  );

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('인증 서버 API 명세서') // 자원 서버 관련 제목
    .setDescription('Aletheia 인증 서버의 API 명세서 입니다.')
    .addTag('auth', '인증 관련 API')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'access_token',
        description: 'Enter your access token',
        in: 'header',
      },
      'access_token',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your refresh token',
        in: 'header',
      },
      'refresh_token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // 'api-docs' 경로로 접근

  const port = configService.get<number>('AUTH_PORT') || 8888; // 기본값 8888 설정

  await app.startAllMicroservices();
  await app.listen(port);
};

bootstrap();
