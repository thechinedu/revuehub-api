import { CommentLevel, CommentStatus } from '@/types';

export type CreateCommentDto = {
  repository_blob_id: number;
  parent_comment_id?: number;
  content: string;
  start_line?: number;
  end_line?: number;
  insertion_pos?: number;
  status?: CommentStatus;
  level: CommentLevel;
};
