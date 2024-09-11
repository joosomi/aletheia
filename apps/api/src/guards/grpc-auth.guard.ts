import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Request } from 'express';
import { Observable, firstValueFrom } from 'rxjs';
interface AuthService {
  validateToken(data: {
    token: string;
  }): Observable<{ isValid: boolean; userId: string; username: string; role: string }>;
}

@Injectable()
export class GrpcAuthGuard implements CanActivate {
  private authService: AuthService;

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) {}

  onModuleInit(): void {
    this.authService = this.client.getService<AuthService>('AuthService');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request); //헤더에서 토큰 추출
    //토큰이 없는 경우
    if (!token) {
      throw new UnauthorizedException('인증에 실패하였습니다. 다시 로그인 해주세요.');
    }

    try {
      // gRPC를 통해 인증 서버에 토큰 검증 요청
      const response = await firstValueFrom(this.authService.validateToken({ token }));
      if (!response.isValid) {
        throw new UnauthorizedException('인증에 실패하였습니다. 다시 로그인 해주세요.');
      }

      request['user'] = {
        userId: response.userId,
        username: response.username,
        role: response.role,
      };
      return true;
    } catch (error) {
      console.error('Error in gRPC call:', error);
      throw new UnauthorizedException('오류가 발생했습니다. 다시 시도해주세요.');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    console.log(token);
    return type === 'Bearer' ? token : undefined;
  }
}
