import { db } from '@/db';
import { CommentEntity } from '@/src/comments/comment.model';
import { CommentLevel, CommentStatus } from '@/types';
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

type CommentFactoryTransientParams = {
  omit: (keyof CommentEntity)[];
  type: 'dto' | 'entity';
};

export const commentFactory = Factory.define<
  CommentEntity,
  CommentFactoryTransientParams
>(
  ({
    transientParams: { omit = [], type = 'dto' },
    afterBuild,
    onCreate,
  }): CommentEntity => {
    afterBuild((comment) => {
      if (type === 'dto') {
        const removeList: (keyof CommentEntity)[] = [
          'id',
          'user_id',
          'created_at',
          'updated_at',
          'parent_comment_id',
          'review_summary_id',
        ];

        removeList.forEach((key) => {
          delete comment[key];
        });
      }

      omit.forEach((key) => {
        delete comment[key];
      });
    });

    onCreate(async (comment) => {
      if (process.env.NODE_ENV === 'test') {
        return (await db('comments').insert(comment).returning('*'))[0];
      }
    });

    return {
      id: faker.datatype.number({ min: 1 }),
      user_id: faker.datatype.number({ min: 1 }),
      content: faker.datatype.string(),
      level: CommentLevel.LINE,
      status: CommentStatus.PENDING,
      snippet: faker.datatype.string(),
      file_path: faker.datatype.string(),
      repository_id: faker.datatype.number(),
      insertion_pos: faker.datatype.number(),
      start_line: faker.datatype.number({ min: 1, max: 10 }),
      end_line: faker.datatype.number({ min: 11, max: 20 }),
      parent_comment_id: faker.datatype.number(),
      review_summary_id: faker.datatype.number(),
      created_at: faker.date.past(),
      updated_at: faker.date.past(),
    };
  },
);
