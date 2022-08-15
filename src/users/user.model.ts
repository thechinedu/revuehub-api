import { db } from '@/db';
import { hashPassword } from '@/utils';
import { Injectable } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user-dto';

export type UserEntity = {
  id: number;
  email: string;
  username: string;
  full_name: string;
  created_at: Date;
  updated_at: Date;
  password_digest: string;
  email_verified: boolean;
  provider: string;
  profile_image_url: string;
};

@Injectable()
export class UserModel {
  async create({ password, ...dto }: CreateUserDto): Promise<UserEntity> {
    return (
      await db
        .insert({ ...dto, password_digest: await hashPassword(password) })
        .into('users')
        .returning('*')
    )[0];
  }
}
