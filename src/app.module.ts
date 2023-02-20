import { AuthModule } from '@/src/auth/auth.module';
import { CommentsModule } from '@/src/comments/comments.module';
import { RepositoriesModule } from '@/src/repositories/repositories.module';
import { UsersModule } from '@/src/users/users.module';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    BullModule.forRoot({
      redis: process.env.REDIS_URL,
    }),
    AuthModule,
    CommentsModule,
    RepositoriesModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
