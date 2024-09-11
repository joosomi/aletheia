import { join } from 'path';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { OrderModule } from './order.module';

import { GlobalExceptionFilter } from '@app/shared/filters/global-exception.filter';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(OrderModule);
  const configService = app.get(ConfigService);

  // gRPC 마이크로서비스 설정
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, 'proto/auth.proto'),
      url: `localhost:${configService.get('API_GRPC_PORT', 50052)}`,
    },
  });

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  app.useLogger(logger);

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('자원 서버 API 명세서') // 자원 서버 관련 제목
    .setDescription('Aletheia 자원 서버의 API 명세서 입니다.')
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
    // .addTag('') // 자원에 대한 설명 추가
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // 'api-docs' 경로로 접근

  const port = configService.get<number>('API_PORT') || 9999; // 기본값 9999 설정

  await app.startAllMicroservices();
  await app.listen(port);
};

bootstrap();
