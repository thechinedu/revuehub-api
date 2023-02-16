import { CommentLevel, CommentStatus } from '@/types';
import { Injectable } from '@nestjs/common';
import { CommentModel } from './comment.model';

import { CreateCommentDto } from './dto/create-comment-dto';

@Injectable()
export class CommentService {
  constructor(private commentModel: CommentModel) {}

  createComment(createCommentDto: CreateCommentDto) {
    if (createCommentDto.level === CommentLevel.PROJECT) {
      createCommentDto.status = CommentStatus.PUBLISHED;
    }

    this.commentModel.create(createCommentDto);
    /* if the project-level comment is saved successfully, it means that the user has successfully submitted a review
     * schedule updates to happen to pending comments that are a part of the review
     */
  }
}
