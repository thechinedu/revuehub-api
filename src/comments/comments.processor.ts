import { db } from '@/db';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('comments')
export class CommentProcessor {
  @Process('publish-review-comments')
  publishReviewComments(job: Job<{ user_id: number; publish_id: number }>) {
    const { data } = job;
  }
}
