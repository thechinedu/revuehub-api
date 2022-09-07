import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './Auth.service';
// import { UserModel } from './user.model';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
