import { AuthModule } from '@/src/auth/auth.module';
import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UserModel } from './user.model';
import { UserService } from './user.service';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UserModel, UserService],
})
export class UsersModule {}
