import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UserModel } from '../users/user.model';
import { AuthController } from './auth.controller';
import { AuthService } from './Auth.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.APP_SECRET as string })],
  controllers: [AuthController],
  providers: [AuthService, UserModel],
})
export class AuthModule {}
