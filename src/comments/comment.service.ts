import { Injectable } from '@nestjs/common';
import { CommentModel } from './comment.model';

import { CreateCommentDto } from './dto/create-comment-dto';

@Injectable()
export class CommentService {
  constructor(private commentModel: CommentModel) {}

  createComment(createCommentDto: CreateCommentDto) {
    this.commentModel.create(createCommentDto);
  }
}
