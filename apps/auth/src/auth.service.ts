import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';

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
      throw new UnauthorizedException('계정명을 다시 확인하세요.');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    // 액세스 토큰과 리프레쉬 토큰 생성
    const payload = { username: user.username, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });

    // 리프레쉬 토큰 해싱 후 저장
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(user.id, { refreshToken: hashedRefreshToken });

    return { accessToken, refreshToken };
  }
}
