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
    return (await this.comments.insert(createCommentDto).returning('*'))[0];
  }

  async find({ where, select }: FindCommentArgs): Promise<CommentEntity> {
    return this.comments.select(select).where(where).first();
  }

  // async findOrCreate({ where, select }: FindCommentArgs): Promise<any> {
  //   const comment = await this.find({
  //     where,
  //     select,
  //   });

  //   if (comment) return comment;
  // }
}
