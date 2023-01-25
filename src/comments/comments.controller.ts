import { AuthGuard } from '@/src/guards/auth';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { CreateCommentDto } from './dto/create-comment-dto';

@Controller({
  path: 'comments',
  version: '1',
})
@UseGuards(AuthGuard)
export class CommentsController {
  @Post()
  createComment(@Body() createCommentDto: CreateCommentDto) {
    console.log({ createCommentDto });
    return 'comment created';
  }
}
