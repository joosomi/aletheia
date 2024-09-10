import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';

interface AuthService {
  validateToken(data: { token: string }): Observable<{ isValid: boolean; userId: string }>;
}

@Injectable()
export class GrpcAuthGuard implements CanActivate {
  private authService: AuthService;

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthService>('AuthService');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      console.log('No token found in request');
      throw new UnauthorizedException();
    }
    try {
      const response = await firstValueFrom(this.authService.validateToken({ token }));
      if (!response.isValid) {
        throw new UnauthorizedException();
      }
      request['user'] = { userId: response.userId };
      return true;
    } catch (error) {
      console.error('Error in gRPC call:', error);
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
