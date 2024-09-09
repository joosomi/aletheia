import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { ApiModule } from './api.module';

import { GlobalExceptionFilter } from '@app/shared/filters/global-exception.filter';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(ApiModule);

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT') || 9999; // 기본값 9999 설정

  await app.listen(port);
};

bootstrap();
