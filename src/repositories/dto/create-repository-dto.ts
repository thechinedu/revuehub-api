export type CreateRepositoryDto = {
  user_id: number;
  snapshot_id: number;
  node_id: string;
  name: string;
  default_branch: string;
  // Match field types from github
  // If additional git providers are supported in the future,
  // these might need to change
  description: string | null;
  last_updated: Date | null;
};
