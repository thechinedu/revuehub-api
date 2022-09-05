import { OAuthProviders } from '@/types';
import { getOAuthProvider } from '@/utils';
import { Injectable } from '@nestjs/common';

import { CreateOauthStateDto } from './dto/create-oauth-state-dto';
import { CreateOauthUserDto } from './dto/create-oauth-user-dto';
import { CreateUserDto } from './dto/create-user-dto';
import { UserModel } from './user.model';

@Injectable()
export class UserService {
  constructor(private userModel: UserModel) {}

  createUser(createUserDto: CreateUserDto) {
    return this.userModel.create(createUserDto);
  }

  createOauthState(createOauthStateDto: CreateOauthStateDto) {
    return this.userModel.createOauthState(createOauthStateDto);
  }

  async createOauthUser(createOauthUserDto: CreateOauthUserDto) {
    const oauthProvider = getOAuthProvider(OAuthProviders.GITHUB); // TODO: use oauth provider passed in from client
    const userInfo = await oauthProvider.getUserInfo(createOauthUserDto);

    if (!userInfo) return null;

    return this.userModel.create(userInfo);
  }
}
