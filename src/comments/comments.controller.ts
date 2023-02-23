import { AuthGuard } from '@/src/guards/auth';
import { ValidationPipe } from '@/src/pipes/validation';
import { RequestWithUserID } from '@/types';
import {
  Body,
  Controller,
  ClassSerializerInterceptor,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { CommentSerializer } from './comment.serializer';

import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment-dto';
import { createCommentValidator } from './validators/create-comment.validator';

@Controller({
  path: 'comments',
  version: '1',
})
@UseGuards(AuthGuard)
export class CommentsController {
  constructor(private commentService: CommentService) {}

  @Post()
  @UsePipes(new ValidationPipe(createCommentValidator))
  @UseInterceptors(ClassSerializerInterceptor)
  async createComment(
    @Req() req: RequestWithUserID,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const commentEntity = await this.commentService.createComment({
      ...createCommentDto,
      user_id: req.userID,
    });
    const data = new CommentSerializer(commentEntity);

    return {
      status: 'success',
      data,
    };
  }

  @Get()
  getAllComments() {
    return [];
  }
}
