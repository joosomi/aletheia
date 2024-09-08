import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AuthModule } from './auth.module';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AuthModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('AUTH_PORT') || 9999; // 기본값 9999 설정

  await app.listen(port);
};

bootstrap();
