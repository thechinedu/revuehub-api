import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './Auth.service';
// import { UserModel } from './user.model';

@Module({
  imports: [JwtModule.register({ secret: process.env.APP_SECRET as string })],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
