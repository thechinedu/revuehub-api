import { db } from '@/db';
import { CommentStatus } from '@/types';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

export const CommentQueueName = 'comments';
export enum CommentQueueJobs {
  PUBLISH_REVIEW_COMMENTS = 'publish-review-comments',
}

@Processor(CommentQueueName)
export class CommentProcessor {
  @Process(CommentQueueJobs.PUBLISH_REVIEW_COMMENTS)
  async publishReviewComments(
    job: Job<{ user_id: number; review_summary_id: number }>,
  ) {
    const {
      data: { user_id, review_summary_id },
    } = job;

    await db('comments')
      .where({ user_id, review_summary_id, status: CommentStatus.PENDING })
      .update({
        status: CommentStatus.PUBLISHED,
      });
  }
}
