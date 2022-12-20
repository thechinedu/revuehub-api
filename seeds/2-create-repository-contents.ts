import { faker } from '@faker-js/faker';
import { Knex } from 'knex';

function getRepositoryContentDto(repository_id: number) {
  return {
    repository_id,
    type: 'tree',
    path: 'src',
    sha: faker.datatype.uuid(),
  };
}

export async function seed(knex: Knex): Promise<void> {
  await knex('repository_contents').del();

  const repository = await knex('repositories').select(['id']).first();

  await knex('repository_contents').insert(
    getRepositoryContentDto(repository.id),
  );
}
