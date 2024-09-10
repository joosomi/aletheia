import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthInfo, JwtUser } from '../strategies/jwt.types';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest<TUser extends JwtUser>(err: Error, user: TUser, info: AuthInfo): TUser {
    if (err || !user) {
      // 리프레시 토큰이 만료된 경우
      if (info && info.name === 'TokenExpiredError') {
        throw new UnauthorizedException('만료된 리프레쉬 토큰입니다.');
      }

      // 리프레시 토큰이 유효하지 않은 경우
      if (info && info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('유효하지 않은 리프레쉬 토큰입니다.');
      }
      throw new UnauthorizedException('리프레쉬 토큰 인증에 실패했습니다.');
    }
    return user;
  }
}
