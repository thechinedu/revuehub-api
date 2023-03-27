export type CreateRepositoryContentsDto = {
  repository_id: number;
  type: string;
  path: string;
  sha: string;
};
