import { AuthGuard } from '@/src/guards/auth';
import { Controller, Post, UseGuards } from '@nestjs/common';

@Controller({
  path: 'comments',
  version: '1',
})
@UseGuards(AuthGuard)
export class CommentsController {
  @Post()
  createComment() {
    return 'comment created';
  }
}
