import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

import { AuthInfo, JwtUser } from '../strategies/jwt.types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super(); //AuthGuard('jwt') 기능을 상속 받음
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context); //jwt 유효성 검사
  }

  handleRequest<TUser extends JwtUser>(err: Error, user: TUser, info: AuthInfo): TUser {
    if (err || !user) {
      // 토큰이 만료된 경우
      if (info && info.name === 'TokenExpiredError') {
        throw new UnauthorizedException('만료된 토큰입니다. 다시 로그인 해주세요.');
      }

      // 토큰이 유효하지 않은 경우
      if (info && info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('유효하지 않은 토큰입니다. 다시 로그인 해주세요.');
      }

      throw new UnauthorizedException('인증에 실패하였습니다. 다시 로그인 해주세요.');
    }

    return user; //인증된 사용자 정보는 request.user로 설정됨
  }
}
