import { db } from '@/db';
import { AuthTokenType } from '@/types';
import { generateRandomToken } from '@/utils';
import { Injectable } from '@nestjs/common';

// import { CreateOauthStateDto } from './dto/create-oauth-state-dto';
// import { CreateUserDto } from './dto/create-user-dto';

type UserAuthTokenEntity = {
  id: number;
  user_id: number;
  token: string;
  type: AuthTokenType;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
};

type CreateAuthTokenArgs = {
  userID: UserAuthTokenEntity['user_id'];
  type: UserAuthTokenEntity['type'];
};

const authTokenExpiryOptions = {
  OAUTH_TOKEN: 365 * 24 * 60 * 60_000, // 1 year
  REFRESH_TOKEN: 48 * 60 * 60_000, // 2 days,
};

@Injectable()
export class UserAuthTokenModel {
  async createAuthToken({
    userID: user_id,
    type,
  }: CreateAuthTokenArgs): Promise<UserAuthTokenEntity> {
    const token = await this.generateAuthToken();

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

  private async generateAuthToken(): Promise<string> {
    const token = generateRandomToken(128);

    const tokenExists = Boolean(
      (await db('user_auth_tokens').where({ token }))[0],
    );

    if (tokenExists) return this.generateAuthToken();

    return token;
  }
}
