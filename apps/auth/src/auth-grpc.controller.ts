import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { AuthService } from './auth.service';

@Controller()
export class AuthGrpcController {
  constructor(private authService: AuthService) {}

  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(data: { token: string }) {
    return this.authService.validateTokenGrpc(data.token);
  }
}
