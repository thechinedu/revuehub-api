import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserAuthTokenModule } from '@/src/user-auth-tokens/user-auth-token.module';

import { CommentsController } from './comments.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.APP_SECRET as string }),
    UserAuthTokenModule,
  ],
  controllers: [CommentsController],
  providers: [CommentService],
})
export class CommentsModule {}
