import { CommentLevel, CommentStatus } from '@/types';
import { Injectable } from '@nestjs/common';
import { CommentModel } from './comment.model';

import { CreateCommentDto } from './dto/create-comment-dto';

@Injectable()
export class CommentService {
  constructor(private commentModel: CommentModel) {}

  async createComment(createCommentDto: CreateCommentDto) {
    if (createCommentDto.level === CommentLevel.PROJECT) {
      createCommentDto.status = CommentStatus.PUBLISHED;
    }

    if (!createCommentDto.review_summary_id) {
      const reviewSummaryComment = await this.commentModel.find({
        where: {
          status: CommentStatus.PENDING,
          level: CommentLevel.PROJECT,
        },
        select: ['review_summary_id'],
      });

      if (!reviewSummaryComment) {
        await this.commentModel.create({
          user_id: createCommentDto.user_id,
          content: '',
          level: CommentLevel.PROJECT,
          status: CommentStatus.PENDING,
          repository_blob_id: createCommentDto.repository_blob_id,
          repository_content_id: createCommentDto.repository_content_id,
          repository_id: createCommentDto.repository_id,
        });
      }
    }

    const comment = await this.commentModel.create(createCommentDto);

    return comment;
  }
}
