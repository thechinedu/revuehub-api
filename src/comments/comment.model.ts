import { db } from '@/db';
import { Injectable } from '@nestjs/common';

import { CreateCommentDto } from './dto/create-comment-dto';

@Injectable()
export class CommentModel {
  async create(createCommentDto: CreateCommentDto): Promise<void> {
    await db('comments').insert(createCommentDto);
  }
}
