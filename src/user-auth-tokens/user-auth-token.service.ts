import { Injectable } from '@nestjs/common';

import { CreateAuthTokenDto } from './dto/create-auth-token-dto';
import { UserAuthTokenModel } from './user-auth-token.model';

@Injectable()
export class UserAuthTokenService {
  constructor(private userAuthTokenModel: UserAuthTokenModel) {}

  createAuthToken(createAuthTokenDto: CreateAuthTokenDto) {
    return this.userAuthTokenModel.createAuthToken(createAuthTokenDto);
  }
}
