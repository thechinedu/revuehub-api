import { CommentLevel, CommentStatus } from '@/types';

export type CreateCommentDto = {
  user_id: number;
  repository_blob_id: number;
  parent_comment_id?: number;
  content: string;
  start_line?: number;
  end_line?: number;
  status?: CommentStatus;
  level: CommentLevel;
};
