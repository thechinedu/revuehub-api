import { db } from '@/db';
import { CommentStatus } from '@/types';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('comments')
export class CommentProcessor {
  @Process('publish-review-comments')
  async publishReviewComments(
    job: Job<{ user_id: number; review_summmary_id: number }>,
  ) {
    const {
      data: { user_id, review_summmary_id },
    } = job;

    await db('comments').where({ user_id, review_summmary_id }).update({
      status: CommentStatus.PUBLISHED,
    });
  }
}
