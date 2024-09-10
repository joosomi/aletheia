import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Request } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

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
   * @returns accessToken, refreshToken
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

  /**
   * 새로운 액세스 토큰 발급
   * @param req
   * @returns accessToken
   */
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: '리프레시 토큰을 사용해 새로운 액세스 토큰 발급' })
  @ApiResponse({
    status: 200,
    description: '새로운 액세스 토큰 발급 성공',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '리프레시 토큰이 유효하지 않거나 만료됨' })
  @ApiBearerAuth('refresh_token')
  @ApiHeader({
    name: 'Authorization',
    description: 'Refresh token',
    required: true,
    schema: {
      type: 'string',
      example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  })
  async refresh(@Request() req): Promise<{ accessToken: string }> {
    const { userId } = req.user;
    return this.authService.refresh(userId); // userId는 JwtRefreshGuard에서 추출됨
  }

  /**
   * 로그아웃
   * @param req
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 204, description: '로그아웃 성공' })
  @ApiResponse({ status: 401, description: '토큰이 유효하지 않거나 만료됨' })
  @ApiBearerAuth('access_token')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access token',
    required: true,
    schema: {
      type: 'string',
      example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  })
  async logout(@Request() req): Promise<void> {
    await this.authService.logout(req.user.id);
  }
}
