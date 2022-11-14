import { db } from '@/db';
import { AuthTokenType } from '@/types';
import { generateRandomToken } from '@/utils';
import { Injectable } from '@nestjs/common';

import { CreateAuthTokenDto } from './dto/create-auth-token-dto';

type UserAuthTokenEntity = {
  id: number;
  user_id: number;
  token: string;
  type: AuthTokenType;
  is_valid: boolean;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
};

type UserAuthTokenEntityKeys = keyof UserAuthTokenEntity;

export type RemoveAllArgs = {
  where: Partial<UserAuthTokenEntity>;
};

type FindUserAuthTokenArgs = {
  where: Partial<UserAuthTokenEntity>;
  select: UserAuthTokenEntityKeys[];
};

const authTokenExpiryOptions = {
  OAUTH_TOKEN: 365 * 24 * 60 * 60_000, // 1 year
  REFRESH_TOKEN: 48 * 60 * 60_000, // 2 days,
};

@Injectable()
export class UserAuthTokenModel {
  async create({
    userID: user_id,
    type,
    token: readOnlyToken,
  }: CreateAuthTokenDto): Promise<UserAuthTokenEntity> {
    if (type === AuthTokenType.OAUTH_TOKEN && !readOnlyToken) {
      throw new Error('OAuth token not present');
    }

    const token = readOnlyToken || (await this.generateAuthToken());

    return (
      await db('user_auth_tokens')
        .insert({
          user_id,
          type,
          token,
          expires_at: new Date(Date.now() + authTokenExpiryOptions[type]),
        })
        .returning('*')
    )[0];
  }

  async removeAll({ where }: RemoveAllArgs) {
    await db('user_auth_tokens').where(where).del();
  }

  // TODO: use Promise<UserAuthTokenEntity | undefined> instead as it is the correct type
  async find({
    where,
    select,
  }: FindUserAuthTokenArgs): Promise<UserAuthTokenEntity> {
    return (await db('user_auth_tokens').select(select).where(where))[0];
  }

  private async generateAuthToken(): Promise<string> {
    const token = generateRandomToken(128);

    const tokenExists = Boolean(
      (await db('user_auth_tokens').where({ token }))[0],
    );

    if (tokenExists) return this.generateAuthToken();

    return token;
  }
}
