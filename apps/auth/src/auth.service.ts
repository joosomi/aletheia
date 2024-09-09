import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';

const SALT_ROUNDS = 10;
@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

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
}
