import { db } from '@/db';
import { CommentLevel, CommentStatus } from '@/types';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

import { CreateCommentDto } from './dto/create-comment-dto';

type CommentEntity = {
  id: number;
  user_id: number;
  repository_blob_id: number;
  repository_content_id: number;
  repository_id: number;
  parent_comment_id?: number;
  publish_id?: number;
  content: string;
  start_line?: number;
  end_line?: number;
  insertion_pos?: number;
  status: CommentStatus;
  level: CommentLevel;
  created_at: Date;
  updated_at: Date;
};

type CommentEntityKeys = keyof CommentEntity;

@Injectable()
export class CommentModel {
  constructor(@InjectQueue('comments') private readonly commentQueue: Queue) {}

  async create(createCommentDto: CreateCommentDto): Promise<CommentEntity> {
    const rows = await db('comments').insert(createCommentDto).returning('*');
    const res = rows[0] as CommentEntity;

    if (res.level === CommentLevel.PROJECT) {
      await this.commentQueue.add({
        user_id: res.user_id,
        publish_id: res.id,
      });
    }

    return res;
  }
}

// ES import, export
// default
//  export default
// import <>

// NodeJS, commonJS
// require, exports
// module.export =
