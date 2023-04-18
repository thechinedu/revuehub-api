import { AuthGuard } from '@/src/guards/auth';
import { QueryParamsToObjectPipe } from '@/src/pipes/query-params-to-object';
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
  Query,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { CommentSerializer } from './comment.serializer';

import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment-dto';
import { createCommentValidator } from './validators/create-comment.validator';
import { getAllCommentsValidator } from './validators/get-all-comments.validator';

export function validateGetCommentsQueryParams(
  req: RequestWithUserID,
  res: Response,
  next: NextFunction,
) {
  console.log('middleware time');
  const ret = new ValidationPipe(getAllCommentsValidator);
  // if (await ret.transform(req.query)) {
  //   next();
  // }
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

  /**
   * @Query(
      'repository_id',
      new QueryParamsToObjectPipe('repository_id'),
      new ValidationPipe(getAllCommentsValidator),
    )
    { repository_id }: { repository_id: number },
    @Query('file_path') { file_path }: { file_path: string },
   * 
   */

  @Get()
  getAllComments(@Req() request: RequestWithUserID) {
    console.log(request.query);
    // return this.commentService.fetchAllComments(repository_id);
    return [];
  }
}
