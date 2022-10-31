import { memoryStore } from '@/db';
import { UserAuthTokenModel } from '@/src/user-auth-tokens/user-auth-token.model';
import { AuthTokenType, OAuthProviders } from '@/types';
import { generateOAuthState, getOAuthProvider } from '@/utils';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

import { CreateOAuthStateDto } from './dto/create-oauth-state-dto';
import { CreateUserFromOAuthDto } from './dto/create-user-from-oauth-dto';
import { UserCredentialsAfterValidation } from './dto/user-credentials-dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userAuthTokenModel: UserAuthTokenModel,
  ) {}

  async loginUser(userID: UserCredentialsAfterValidation['id'], res: Response) {
    await this.setSessionTokens(userID, res);
  }

  async createOAuthState({ provider }: CreateOAuthStateDto) {
    const state = await generateOAuthState();
    const memoryStoreClient = await memoryStore;

    memoryStoreClient.set(state, provider);
    memoryStoreClient.expire(state, 15 * 60); // expires in 15 minutes

    return state;
  }

  async fetchOAuthUserInfo(oauthUserInfo: CreateUserFromOAuthDto) {
    const { state } = oauthUserInfo;
    const memoryStoreClient = await memoryStore;

    const provider = await memoryStoreClient.get(state);

    if (!provider) return null;

    memoryStoreClient.del(state);

    const oauthProviderStrategy = getOAuthProvider(provider as OAuthProviders);
    const userInfo = await oauthProviderStrategy.getUserInfo(oauthUserInfo);

    if (!userInfo) return null;

    return userInfo;
  }

  async refresh(refreshToken: string, userID: number, res: Response) {
    // TODO: Remove refreshToken on client as well
    await this.userAuthTokenModel.removeAll({
      where: {
        user_id: userID,
        token: refreshToken,
        type: AuthTokenType.REFRESH_TOKEN,
      },
    });

    await this.setSessionTokens(userID, res);
  }

  private async setSessionTokens(userID: number, res: Response) {
    const accessToken = this.jwtService.sign(
      {
        id: userID,
      },
      {
        expiresIn: '15m',
      },
    );
    const { token: refreshToken } = await this.userAuthTokenModel.create({
      userID,
      type: AuthTokenType.REFRESH_TOKEN,
    });

    // SameSite: https://web.dev/samesite-cookies-explained/
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 15 * 60_000), // 15 minutes
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 48 * 60 * 60_000), // 2 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
  }
}
