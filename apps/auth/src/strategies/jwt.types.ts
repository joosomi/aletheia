import { UserRole } from '../entities/user.entity';

export type JwtPayload = {
  sub: string;
  username: string;
  role: UserRole;
};

export type JwtUser = {
  id: string;
  username: string;
  role: UserRole;
};

export type AuthInfo = {
  name?: string;
  message?: string;
};
