import { CommentLevel, CommentView } from '@/types';
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

  fetchAllComments(repositoryID: number, filePath: string, view: CommentView) {
    const views = {
      [CommentView.OVERVIEW]: () => {
        return this.commentModel.findAllOverviewComments(repositoryID);
      },
      [CommentView.CODE]: () => {
        return this.commentModel.findAll({
          where: {
            repository_id: repositoryID,
            file_path: filePath,
          },
          whereNot: {
            level: CommentLevel.PROJECT,
          },
          orderBy: [{ column: 'insertion_pos', order: 'asc' }],
          select: [
            'content',
            'username',
            'profile_image_url',
            'status',
            'insertion_pos',
            'status',
          ],
        });
      },
    };

    return views[view]();
  }
}
