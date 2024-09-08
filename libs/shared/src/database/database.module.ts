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
            return {
              type: 'mariadb',
              host: configService.get(`${dbType}_DB_HOST`, 'localhost'),
              port: configService.get<number>(`${dbType}_DB_PORT`),
              username: configService.get(`${dbType}_DB_USER`),
              password: configService.get(`${dbType}_DB_PASSWORD`),
              database: configService.get(`${dbType}_DB_NAME`),
              autoLoadEntities: true,
              synchronize: configService.get('NODE_ENV') !== 'production',
            };
          },
          inject: [ConfigService],
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}
