import { CreateCommentDto } from './create-comment-dto';

export type UpdateCommentDto = Pick<CreateCommentDto, 'content'>;
