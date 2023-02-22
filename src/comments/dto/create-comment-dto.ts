import { CommentLevel, CommentStatus } from '@/types';

export type CreateCommentDto = {
  user_id?: number;
  repository_blob_id?: number;
  repository_content_id?: number;
  repository_id?: number;
  parent_comment_id?: number;
  review_summary_id?: number;
  content: string;
  start_line?: number;
  end_line?: number;
  insertion_pos?: number;
  status?: CommentStatus;
  level: CommentLevel;
};
