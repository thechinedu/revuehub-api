import { Knex } from 'knex';

function getRepositoryBlobDto(repository_content_id: number) {
  return {
    repository_content_id,
    content: 'aGVsbG8=',
  };
}

export async function seed(knex: Knex): Promise<void> {
  await knex('repository_blobs').del();
  const repositoryContent = await knex('repository_contents')
    .where({ type: 'blob' })
    .select(['id'])
    .first();

  await knex('repository_blobs').insert(
    getRepositoryBlobDto(repositoryContent.id),
  );
}
