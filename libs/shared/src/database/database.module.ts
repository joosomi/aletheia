import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({})
export class SharedDatabaseModule {
  static forRoot(dbType: 'API' | 'AUTH'): DynamicModule {
    return {
      module: SharedDatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => {
            const isDevelopment = configService.get<string>('NODE_ENV') === 'development';

            return {
              type: 'mariadb',
              host: configService.get(`${dbType}_DB_HOST`, 'localhost'),
              port: configService.get<number>(`${dbType}_DB_PORT`),
              username: configService.get(`${dbType}_DB_USER`),
              password: configService.get(`${dbType}_DB_PASSWORD`),
              database: configService.get(`${dbType}_DB_NAME`),
              autoLoadEntities: true,
              synchronize: isDevelopment, // 개발 환경에서만 true
              logging: isDevelopment, // 개발 환경에서만 로깅
            };
          },
          inject: [ConfigService],
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}
