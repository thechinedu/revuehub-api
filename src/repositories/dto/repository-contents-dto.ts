export type RepositoryContentsDto = {
  repository_id: number;
  type: string;
  path: string;
  sha: string;
};

// table.integer('repository_id').unsigned();
// table.string('type');
// table.string('path').unique();
// table.string('sha').unique();
// table.timestamps(false, true);
