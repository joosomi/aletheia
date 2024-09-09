import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }), // 한국 시간으로 변환
      path: request.url,
      method: request.method,
      message: typeof message === 'object' && 'message' in message ? message.message : message,
    };

    this.logger.error(`${request.method} ${request.url} - ${errorResponse.message}`, errorResponse);

    response.status(status).json(errorResponse);
  }
}
