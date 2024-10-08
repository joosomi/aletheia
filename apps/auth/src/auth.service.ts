import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './strategies/jwt.types';

const SALT_ROUNDS = 10;
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 사용자 회원가입
   * @param registerDto
   */
  async register(registerDto: RegisterDto): Promise<void> {
    const { username, password } = registerDto;

    //계정명 중복 확인
    const existingMember = await this.userRepository.findOneBy({ username });

    if (existingMember) {
      throw new ConflictException('이미 존재하는 계정명입니다.');
    }

    //비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    //회원 데이터 insert
    await this.userRepository.insert({
      username,
      password: hashedPassword,
    });
  }

  /**
   * 사용자 로그인
   * @param loginDto
   * @returns accessToken, refreshToken
   */
  async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const { username, password } = loginDto;

    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new UnauthorizedException('계정명 또는 비밀번호가 잘못되었습니다.');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('계정명 또는 비밀번호가 잘못되었습니다.');
    }

    // 액세스 토큰과 리프레쉬 토큰 생성
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });

    // JWT 토큰에서 만료 시간 추출
    const decodedRefreshToken = this.jwtService.decode(refreshToken) as { exp: number };
    const expiresAt = new Date(decodedRefreshToken.exp * 1000); // exp는 초 단위이므로 밀리초로 변환

    // 리프레쉬 토큰 해싱 후 저장
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(user.id, { refreshToken: hashedRefreshToken, refreshTokenExpiresAt: expiresAt });

    return { accessToken, refreshToken };
  }

  /**
   * 리프레쉬 토큰 유효성 검사
   * @param userId
   * @param refreshToken
   * @returns
   */
  async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'refreshToken', 'refreshTokenExpiresAt'],
    });

    if (!user?.refreshToken || !user.refreshTokenExpiresAt) {
      return false;
    }

    // 리프레시 토큰 만료 시간 확인
    if (user.refreshTokenExpiresAt < new Date()) {
      return false;
    }

    // 저장된 리프레시 토큰과 비교
    const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    return isTokenValid;
  }

  /**
   * 새로운 액세스 토큰 발급
   * @param userId
   * @returns accessToken
   */
  async refresh(userId: string): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload); // 새로운 액세스 토큰 발급

    return { accessToken };
  }

  /**
   * 로그아웃
   * @param userId
   */
  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: null });
  }

  /**
   * gRPC 액세스 토큰 유효성 검사
   * 유효하면 payload return
   * @param token
   * @returns
   */
  async validateTokenGrpc(
    token: string,
  ): Promise<{ isValid: boolean; userId?: string; username?: string; role?: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return {
        isValid: true,
        userId: payload.sub,
        username: payload.username,
        role: payload.role,
      };
    } catch (error) {
      console.error('Token verification failed:', error); // 에러 로그
      return { isValid: false };
    }
  }
}
