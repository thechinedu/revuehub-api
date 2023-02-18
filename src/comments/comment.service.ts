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

/**
 * First idea:
 * Add a reviews table
 * id, content, user_id
 * comments table updated to have a review_id (foreign key => reviews table)
 * How to add a new comment (when no comment exists yet):
 *  Create comment in comment table
 *    if review_id is present -> save comment
 *    else create new review, attach review_id to comment and save comment
 *  Send comment data (including review_id) back to client
 * How to submit a review:
 *  Get review_id from any comment data on the client
 *  Make request to dedicated submit_review endpoint
 *  Find review by review_id (throw an error if it doesn't exist)
 *    update review summary content if supplied
 *    update the status of every comment with the given review_id to PUBLISHED (background job)
 *
 * Second idea:
 *  if comment level is PROJECT, treat as review submission
 *  find all pending comments by the user at the time of submission and add to a queue for later processing (background job)
 *    update the status of comments in the queue to PUBLISHED
 *  save project-level comment
 *
 * Second idea:
 *  How do I associate comments to their review group?
 *    Potential solution:
 *      Add a publish_id column to the comments table
 *      The publish_id will map to the id of the project-level comment
 *      When updating the status of comments, update their publish ids as well
 */
