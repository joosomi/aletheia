import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({
              format: () =>
                new Date().toLocaleString('ko-KR', {
                  timeZone: 'Asia/Seoul',
                  hour12: false,
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }),
            }),
            winston.format.ms(),
            winston.format.colorize({ all: true }),
            winston.format.printf(({ timestamp, level, message, ms, context, ...meta }) => {
              let log = `[Aletheia] ${process.pid}  - ${timestamp}     ${level} [${context || 'undefined'}] ${message}${ms ? ` ${ms}` : ''}`;
              if (Object.keys(meta).length > 0) {
                log += '\n' + JSON.stringify(meta, null, 2);
              }
              return log;
            }),
          ),
        }),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
