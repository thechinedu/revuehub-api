import { memoryStore } from '@/db';
import { UserModel } from '@/src/users/user.model';
import { UserAuthTokenService } from '@/src/user-auth-tokens/user-auth-token.service';
import { AuthTokenType, OAuthProviders } from '@/types';
import { generateOAuthState, getOAuthProvider } from '@/utils';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CreateOAuthStateDto } from './dto/create-oauth-state-dto';
import { CreateUserFromOAuthDto } from './dto/create-user-from-oauth-dto';
import { UserCredentialsDto } from './dto/user-credentials-dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userModel: UserModel,
    private userAuthTokenService: UserAuthTokenService,
  ) {}

  async loginUser(userCredentialsDto: UserCredentialsDto) {
    const user = await this.userModel.find({
      where: {
        email: userCredentialsDto.email,
      },
      select: ['id'],
    });
    const accessToken = this.jwtService.sign(
      {
        id: user.id,
      },
      {
        expiresIn: '15m',
      },
    );
    const { token: refreshToken } =
      await this.userAuthTokenService.createAuthToken({
        userID: user.id,
        type: AuthTokenType.REFRESH_TOKEN,
      });

    return { accessToken, refreshToken };
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
}
