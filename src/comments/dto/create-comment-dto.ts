enum CommentStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  RESOLVED = 'RESOLVED',
}

enum CommentLevel {
  LINE = 'LINE',
  FILE = 'FILE',
  PROJECT = 'PROJECT',
}

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
