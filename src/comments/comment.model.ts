import { db } from '@/db';
import { CommentLevel, CommentStatus } from '@/types';
import { Injectable } from '@nestjs/common';

import { CreateCommentDto } from './dto/create-comment-dto';

export type CommentEntity = {
  id: number;
  user_id: number;
  repository_blob_id: number;
  repository_content_id: number;
  repository_id: number;
  parent_comment_id: number | null;
  review_summary_id: number;
  content: string;
  start_line: number | null;
  end_line: number | null;
  insertion_pos: number | null;
  status: CommentStatus;
  level: CommentLevel;
  created_at: Date;
  updated_at: Date;
};

type CommentEntityKeys = keyof CommentEntity;

type FindCommentArgs = {
  where: Partial<CommentEntity>;
  select: (CommentEntityKeys | '*')[];
};

@Injectable()
export class CommentModel {
  comments = db('comments');

  async create(
    createCommentDto: Partial<CreateCommentDto>,
  ): Promise<CommentEntity> {
    return (await db('comments').insert(createCommentDto).returning('*'))[0];
  }

  async find({
    where,
    select,
  }: FindCommentArgs): Promise<CommentEntity | undefined> {
    return db('comments').where(where).select(select).first();
  }

  async findOrCreateProjectReviewComment({
    user_id,
    repository_id,
  }: Pick<
    CreateCommentDto,
    'user_id' | 'repository_id'
  >): Promise<CommentEntity> {
    const comment = await this.find({
      where: {
        user_id,
        repository_id,
        level: CommentLevel.PROJECT,
        status: CommentStatus.PENDING,
        content: '',
      },
      select: ['id', 'review_summary_id'],
    });

    if (comment) return comment;

    return this.create({
      content: '',
      user_id,
      level: CommentLevel.PROJECT,
      status: CommentStatus.PENDING,
      repository_id,
    });
  }

  async upsertProjectReviewComment({
    user_id,
    repository_id,
    content,
  }: CreateCommentDto): Promise<CommentEntity> {
    const comment = await this.findOrCreateProjectReviewComment({
      user_id,
      repository_id,
    });

    const updatedComment = (
      await db('comments')
        .where({ id: comment.id })
        .update({
          content,
          status: CommentStatus.PUBLISHED,
        })
        .returning('*')
    )[0];

    return updatedComment;
  }
}
