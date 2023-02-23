import { CommentLevel } from '@/types';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { CommentEntity, CommentModel } from './comment.model';

import { CreateCommentDto } from './dto/create-comment-dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectQueue('comments') private readonly commentQueue: Queue,
    private commentModel: CommentModel,
  ) {}

  async createComment(
    createCommentDto: CreateCommentDto,
  ): Promise<CommentEntity> {
    if (createCommentDto.level === CommentLevel.PROJECT) {
      const reviewSummaryComment =
        await this.commentModel.upsertProjectReviewComment(createCommentDto);

      this.commentQueue.add('publish-review-comments', {
        user_id: reviewSummaryComment.user_id,
        review_summmary_id: reviewSummaryComment.review_summary_id,
      });

      return reviewSummaryComment;
    }

    if (!createCommentDto.review_summary_id) {
      const reviewSummaryComment =
        await this.commentModel.findOrCreateProjectReviewComment({
          user_id: createCommentDto.user_id,
          repository_id: createCommentDto.repository_id,
        });

      createCommentDto.review_summary_id =
        reviewSummaryComment.review_summary_id;
    }

    return this.commentModel.create(createCommentDto);
  }
}
