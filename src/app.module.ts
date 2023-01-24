import { AuthModule } from '@/src/auth/auth.module';
import { CommentsModule } from '@/src/comments/comments.module';
import { RepositoriesModule } from '@/src/repositories/repositories.module';
import { UsersModule } from '@/src/users/users.module';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [AuthModule, CommentsModule, RepositoriesModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
