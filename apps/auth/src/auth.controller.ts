import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 사용자 회원가입
   * @param registerDto
   * @returns
   */
  @Post('register')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '회원가입', description: '새로운 사용자를 등록합니다.' })
  @ApiResponse({ status: 204, description: '회원가입 성공' })
  @ApiResponse({ status: 409, description: '이미 존재하는 계정명으로 로그인 시도' }) // 409 Conflict 에러
  @ApiResponse({
    status: 400,
    description: '잘못된 요청: 빈 값이거나, 잘못된 형식일 경우.',
  }) // 400 Bad Request 에러
  async register(@Body() registerDto: RegisterDto): Promise<void> {
    return this.authService.register(registerDto);
  }

  /**
   * 사용자 로그인
   * @param loginDto
   * @returns
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인', description: '사용자가 로그인합니다.' })
  @ApiResponse({ status: 200, description: '로그인 성공 및 액세스, 리프레쉬 토큰 발급' })
  @ApiResponse({ status: 401, description: '로그인 실패(아이디, 비밀번호 오류)' })
  @ApiResponse({ status: 400, description: '잘못된 요청: 계정명이나 비밀번호가 빈 값인 경우' })
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.login(loginDto);
  }
}
