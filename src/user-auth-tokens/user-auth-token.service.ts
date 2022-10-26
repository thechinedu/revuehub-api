import { AuthTokenType } from '@/types';
import { Injectable } from '@nestjs/common';

import { CreateAuthTokenDto } from './dto/create-auth-token-dto';
import { RemoveAllArgs, UserAuthTokenModel } from './user-auth-token.model';

@Injectable()
export class UserAuthTokenService {
  constructor(private userAuthTokenModel: UserAuthTokenModel) {}

  createAuthToken(createAuthTokenDto: CreateAuthTokenDto) {
    return this.userAuthTokenModel.create(createAuthTokenDto);
  }
  // TODO: Update this so that the where object is not passed from the controller
  // Make this more granular/specific (removeOAuthTokens for example)
  removeAll({ where }: RemoveAllArgs) {
    this.userAuthTokenModel.removeAll({
      where,
    });
  }

  findRefreshToken(token: string) {
    return this.userAuthTokenModel.find({
      where: { type: AuthTokenType.REFRESH_TOKEN, token },
      select: ['is_valid', 'expires_at', 'user_id'],
    });
  }
}
