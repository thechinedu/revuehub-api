import { db } from '@/db';
import { hashPassword } from '@/utils';
import { Injectable } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user-dto';

@Injectable()
export class UserModel {
  private createUserRet = [
    'id',
    'email',
    'username',
    'full_name',
    'created_at',
    'updated_at',
  ];

  async create({ password, ...dto }: CreateUserDto) {
    return await db
      .insert({ ...dto, password_digest: await hashPassword(password) })
      .into('users')
      .returning(this.createUserRet);
  }
}
