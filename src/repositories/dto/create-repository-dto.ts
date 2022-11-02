export type CreateRepositoryDto = {
  user_id: number;
  snapshot_id: number;
  node_id: string;
  name: string;
  default_branch: string;
  description?: string;
  last_updated?: Date;
};
