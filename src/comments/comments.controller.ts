import { AuthGuard } from '@/src/guards/auth';
import { ValidationPipe } from '@/src/pipes/validation';
import { CommentView, RequestWithUserID } from '@/types';
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
import { NextFunction, Request, Response } from 'express';

import { CommentSerializer } from './comment.serializer';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment-dto';
import { createCommentValidator } from './validators/create-comment.validator';
import { getAllCommentsValidator } from './validators/get-all-comments.validator';

export async function validateGetCommentsQueryParams(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  await new ValidationPipe(getAllCommentsValidator).transform(req.query);

  next();
}

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
  @UseInterceptors(ClassSerializerInterceptor)
  async getAllComments(
    @Req() { query: { repository_id, file_path, view } }: RequestWithUserID,
  ) {
    const repositoryID = +(repository_id as string);
    const filePath = file_path as string;
    const viewName = view as 'overview' | 'code';
    const commentView =
      viewName === 'overview' ? CommentView.OVERVIEW : CommentView.CODE;

    const data = await this.commentService.fetchAllComments(
      repositoryID,
      filePath,
      commentView,
    );
    // const data = new CommentsSerializer(commentEntities).comments;

    return {
      status: 'success',
      data,
    };
  }
}
