import { BullModule } from '@nestjs/bull';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserAuthTokenModule } from '@/src/user-auth-tokens/user-auth-token.module';

import {
  CommentsController,
  validateGetCommentsQueryParams,
} from './comments.controller';
import { CommentModel } from './comment.model';
import { CommentService } from './comment.service';
import { CommentProcessor, CommentQueueName } from './comments.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: CommentQueueName,
    }),
    JwtModule.register({ secret: process.env.APP_SECRET as string }),
    UserAuthTokenModule,
  ],
  controllers: [CommentsController],
  providers: [CommentService, CommentModel, CommentProcessor],
})
export class CommentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(validateGetCommentsQueryParams)
      .forRoutes({ path: 'comments', method: RequestMethod.GET });
  }
}
