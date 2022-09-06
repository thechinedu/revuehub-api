import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
// import { UserModel } from './user.model';
// import { UserService } from './user.service';

@Module({
  controllers: [AuthController],
  providers: [],
})
export class AuthModule {}
