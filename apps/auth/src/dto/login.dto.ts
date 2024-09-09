import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '계정명', example: 'john_doe' })
  @IsNotEmpty({ message: '계정명은 비워둘 수 없습니다.' })
  @IsString()
  username: string;

  @ApiProperty({ description: '비밀번호', example: 'strong_password_123' })
  @IsNotEmpty({ message: '비밀번호는 비워둘 수 없습니다.' })
  @IsString()
  password: string;
}
