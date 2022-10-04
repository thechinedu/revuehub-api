import { db } from '@/db';
import { PartialRecord } from '@/types';
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

type UserEntityKeys = keyof UserEntity;

type FindUserArgs = {
  where: PartialRecord<UserEntityKeys, string>;
  select: UserEntityKeys[];
};

@Injectable()
export class UserModel {
  async create({ password, ...dto }: CreateUserDto): Promise<UserEntity> {
    return (
      await db('users')
        .insert({ ...dto, password_digest: await hashPassword(password) })
        .returning('*')
    )[0];
  }

  async find({ where, select }: FindUserArgs): Promise<UserEntity> {
    return (await db('users').select(select).where(where))[0];
  }

  async findOrCreate({ email, ...rest }: CreateUserDto): Promise<UserEntity> {
    const user = this.find({
      where: {
        email,
      },
      select: ['id'],
    });

    if (user) return user;

    return this.create({ email, ...rest });
  }
}
