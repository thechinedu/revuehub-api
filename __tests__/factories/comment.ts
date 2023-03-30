import { CreateCommentDto } from '@/src/comments/dto/create-comment-dto';
import { CommentLevel, CommentStatus } from '@/types';
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

type CommentRequestBodyTransientParams = {
  omit: (keyof CreateCommentDto)[];
};

export const commentRequestBody = Factory.define<
  CreateCommentDto,
  CommentRequestBodyTransientParams
>(
  ({
    params: {
      content = 'hello world',
      level = CommentLevel.LINE,
      status = CommentStatus.PENDING,
    },
    transientParams: { omit = [] },
    afterBuild,
  }) => {
    afterBuild((comment) => {
      omit.forEach((key) => {
        delete comment[key];
      });
    });

    return {
      content,
      level,
      status,
      repository_blob_id: faker.datatype.number(),
      repository_content_id: faker.datatype.number(),
      repository_id: faker.datatype.number(),
      insertion_pos: faker.datatype.number(),
      start_line: faker.datatype.number({ min: 1, max: 10 }),
      end_line: faker.datatype.number({ min: 11, max: 20 }),
    };
  },
);
