import { memoryStore } from '@/db';
import { UserModel } from '@/src/users/user.model';
import { UserAuthTokenModel } from '@/src/user-auth-tokens/user-auth-token.model';
import { AuthTokenType, OAuthProviders } from '@/types';
import { generateRandomToken, getOAuthProvider } from '@/utils';
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
    private userAuthTokenModel: UserAuthTokenModel,
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
      await this.userAuthTokenModel.createAuthToken({
        userID: user.id,
        type: AuthTokenType.REFRESH_TOKEN,
      });

    return { accessToken, refreshToken };
  }

  createOAuthState(createOAuthStateDto: CreateOAuthStateDto) {
    // TODO: Generate state and store it in memory store with oauth provider deets

    // const state = randomUUID()
    // await memoryStore.set(state, provider)
    // (await memoryStore).set('key', 'value');

    return generateRandomToken(32);
  }

  async fetchOAuthUserInfo(oauthUserInfo: CreateUserFromOAuthDto) {
    const oauthProvider = getOAuthProvider(OAuthProviders.GITHUB); // TODO: use oauth provider passed in from client
    const userInfo = await oauthProvider.getUserInfo(oauthUserInfo);

    if (!userInfo) return null;

    return userInfo;
  }
}
