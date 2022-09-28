import { UserAuthTokenModel } from '@/src/user-auth-tokens/user-auth-token.model';
import { UserModel } from '@/src/users/user.model';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './Auth.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.APP_SECRET as string })],
  controllers: [AuthController],
  providers: [AuthService, UserModel, UserAuthTokenModel],
  exports: [AuthService],
})
export class AuthModule {}
