import { CreateCommentDto } from '@/src/comments/dto/create-comment-dto';
import { CommentLevel, CommentStatus } from '@/types';
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export const commentRequestBody = Factory.define<CreateCommentDto>(
  ({
    params: {
      content = 'hello world',
      level = CommentLevel.LINE,
      status = CommentStatus.PENDING,
    },
  }) => ({
    content,
    level,
    status,
    repository_blob_id: faker.datatype.number(),
    repository_content_id: faker.datatype.number(),
    repository_id: faker.datatype.number(),
    insertion_pos: faker.datatype.number(),
    start_line: faker.datatype.number(),
    end_line: faker.datatype.number(),
  }),
);
