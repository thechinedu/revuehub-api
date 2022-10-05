import { Injectable } from '@nestjs/common';

import { CreateAuthTokenDto } from './dto/create-auth-token-dto';
import { RemoveAllArgs, UserAuthTokenModel } from './user-auth-token.model';

@Injectable()
export class UserAuthTokenService {
  constructor(private userAuthTokenModel: UserAuthTokenModel) {}

  createAuthToken(createAuthTokenDto: CreateAuthTokenDto) {
    return this.userAuthTokenModel.create(createAuthTokenDto);
  }

  removeAll({ where }: RemoveAllArgs) {
    this.userAuthTokenModel.removeAll({
      where,
    });
  }
}
