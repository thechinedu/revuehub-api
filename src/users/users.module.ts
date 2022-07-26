import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UserModel } from './user.model';
import { UserService } from './user.service';

@Module({
  controllers: [UsersController],
  providers: [UserModel, UserService],
})
export class UsersModule {}
