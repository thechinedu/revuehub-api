import { Module } from '@nestjs/common';

import { UserAuthTokenModel } from './user-auth-token.model';
import { UserAuthTokenService } from './user-auth-token.service';

@Module({
  providers: [UserAuthTokenModel, UserAuthTokenService],
  exports: [UserAuthTokenService],
})
export class UserAuthTokenModule {}
