import { CommentLevel } from '@/types';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

import { CommentEntity, CommentModel } from './comment.model';
import { CommentQueueName, CommentQueueJobs } from './comments.processor';
import { CreateCommentDto } from './dto/create-comment-dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectQueue(CommentQueueName) private readonly commentQueue: Queue,
    private commentModel: CommentModel,
  ) {}

  async createComment(
    createCommentDto: CreateCommentDto,
  ): Promise<CommentEntity> {
    console.log({ createCommentDto });
    if (createCommentDto.level === CommentLevel.PROJECT) {
      const reviewSummaryComment =
        await this.commentModel.upsertProjectReviewComment(createCommentDto);

      this.commentQueue.add(CommentQueueJobs.PUBLISH_REVIEW_COMMENTS, {
        user_id: reviewSummaryComment.user_id,
        review_summary_id: reviewSummaryComment.review_summary_id,
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
