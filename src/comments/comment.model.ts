import { db } from '@/db';
import { CommentLevel, CommentStatus } from '@/types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity, UserEntityKeys } from '../users/user.model';

import { CreateCommentDto } from './dto/create-comment-dto';
import { UpdateCommentDto } from './dto/update-comment-dto';

export type CommentEntity = {
  id: number;
  user_id: number;
  snippet: string;
  file_path: string;
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
  whereNot?: Partial<CommentEntity>;
  select: (CommentEntityKeys | UserEntityKeys)[];
  orderBy?: {
    column: CommentEntityKeys;
    order: 'asc' | 'desc';
  }[];
  groupBy?: CommentEntityKeys[];
};

@Injectable()
export class CommentModel {
  comments = db('comments');

  async create(
    createCommentDto: Partial<CreateCommentDto>,
  ): Promise<CommentEntity> {
    return (await db('comments').insert(createCommentDto).returning('*'))[0];
  }

  // TODO: Remove if this is not needed
  find({ where, select }: FindCommentArgs): Promise<CommentEntity | undefined> {
    return db('comments').where(where).select(select).first();
  }

  async findAllCodeComments(repositoryID: number, filePath: string) {
    const comments = await db('comments')
      .join('users', 'users.id', 'comments.user_id')
      .where({
        repository_id: repositoryID,
        file_path: filePath,
      })
      .whereNot({
        level: CommentLevel.PROJECT,
      })
      .select([
        'content',
        'username',
        'profile_image_url',
        'status',
        'insertion_pos',
        'status',
        'level',
        'snippet',
        'start_line',
        'end_line',
        'parent_comment_id',
        'comments.id',
        'comments.created_at',
      ])
      .orderBy([
        { column: 'insertion_pos', order: 'asc' },
        { column: 'created_at', order: 'asc' },
      ]);
    const parentComments: (Pick<
      CommentEntity & UserEntity,
      'id' | 'content' | 'username' | 'created_at'
    > & { replies: (CommentEntity & UserEntity)[] })[] = comments
      .filter((comment) => comment.parent_comment_id == null)
      .map((comment) => ({ ...comment, replies: [] }));
    const parentCommentKeys = new Map<number, number>();

    parentComments.forEach((comment, idx) => {
      parentCommentKeys.set(comment.id, idx);
    });

    const replies = comments.filter(
      (comment) => comment.parent_comment_id != null,
    );

    replies.forEach((reply) => {
      const parentIdx = parentCommentKeys.get(reply.parent_comment_id);

      if (parentIdx != null) {
        parentComments[parentIdx].replies.push(reply);
      }
    });

    return parentComments;
  }

  async findAllOverviewComments(repositoryID: number) {
    const comments: (CommentEntity & UserEntity)[] = await db('comments')
      .join('users', 'users.id', 'comments.user_id')
      .where({ repository_id: repositoryID })
      .select([
        'comments.id',
        'content',
        'review_summary_id',
        'username',
        'file_path',
        'start_line',
        'end_line',
        'level',
        'snippet',
        'comments.created_at',
        'comments.updated_at',
      ])
      .orderBy([
        { column: 'level', order: 'desc' },
        { column: 'created_at', order: 'asc' },
      ]);
    const reviewSummaryMap = new Map<number, number>();
    const res: (Pick<
      CommentEntity & UserEntity,
      'id' | 'content' | 'username' | 'created_at'
    > & { comments: (CommentEntity & UserEntity)[] })[] = [];

    comments.forEach((comment) => {
      if (
        comment.level === CommentLevel.PROJECT &&
        !reviewSummaryMap.has(comment.review_summary_id)
      ) {
        const reviewCommentEntity = {
          id: comment.id,
          content: comment.content,
          username: comment.username,
          created_at: comment.created_at,
          comments: [],
        };

        res.push(reviewCommentEntity);
        reviewSummaryMap.set(comment.review_summary_id, res.length - 1);

        return;
      }

      const associatedReviewIdx = reviewSummaryMap.get(
        comment.review_summary_id,
      );

      if (associatedReviewIdx != undefined) {
        res[associatedReviewIdx].comments.push(comment);
      }
    });

    return res;
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

  async updateComment(
    commentID: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<CommentEntity> {
    const updatedComment = await db('comments')
      .where({ id: commentID })
      .update(updateCommentDto, ['id', 'content', 'status', 'updated_at']);
    if (updatedComment.length) return updatedComment[0];

    throw new HttpException(
      { status: 'fail', message: 'Comment not found' },
      HttpStatus.NOT_FOUND,
    );
  }

  async deleteComment(commentID: number): Promise<void> {
    const deletedComment = await db('comments').where({ id: commentID }).del();

    if (!deletedComment) {
      throw new HttpException(
        { status: 'fail', message: 'Comment not found' },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
