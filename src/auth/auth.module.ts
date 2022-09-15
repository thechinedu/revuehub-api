import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UserAuthTokenModel } from '../user-auth-tokens/user-auth-token.model';
import { UserModel } from '../users/user.model';
import { AuthController } from './auth.controller';
import { AuthService } from './Auth.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.APP_SECRET as string })],
  controllers: [AuthController],
  providers: [AuthService, UserModel, UserAuthTokenModel],
})
export class AuthModule {}
