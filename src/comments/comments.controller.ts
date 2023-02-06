import { AuthGuard } from '@/src/guards/auth';
import { ValidationPipe } from '@/src/pipes/validation';
import { RequestWithUserID } from '@/types';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';

import { CreateCommentDto } from './dto/create-comment-dto';
import { createCommentValidator } from './validators/create-comment.validator';

@Controller({
  path: 'comments',
  version: '1',
})
@UseGuards(AuthGuard)
export class CommentsController {
  @Post()
  @UsePipes(new ValidationPipe(createCommentValidator))
  createComment(
    @Req() req: RequestWithUserID,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    console.log({ createCommentDto });
    return 'comment created';
  }

  @Get()
  getAllComments() {
    return [];
  }
}
