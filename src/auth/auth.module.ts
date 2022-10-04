import { UserAuthTokenModule } from '@/src/user-auth-tokens/user-auth-token.module';
import { UserModel } from '@/src/users/user.model';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.APP_SECRET as string }),
    UserAuthTokenModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserModel],
  exports: [AuthService],
})
export class AuthModule {}
