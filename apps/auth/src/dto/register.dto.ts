import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 회원가입용 DTO
 */
export class RegisterDto {
  @ApiProperty({ description: '계정명', example: 'john_doe' })
  @IsNotEmpty({ message: '계정명은 비워둘 수 없습니다.' })
  @MinLength(4, { message: '계정명은 최소 4자 이상이어야 합니다.' })
  @IsString()
  username: string;

  @ApiProperty({ description: '비밀번호(6자 이상)', example: 'strong_password_123' })
  @IsNotEmpty({ message: '비밀번호는 비워둘 수 없습니다.' })
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  @IsString()
  password: string;
}
