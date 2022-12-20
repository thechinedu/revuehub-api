import { faker } from '@faker-js/faker';
import { Knex } from 'knex';

function getUserDto() {
  return {
    email: faker.internet.email(),
    username: faker.internet.userName(),
    full_name: faker.name.fullName(),
  };
}

function getRepositoryDto(user_id: number) {
  return {
    user_id,
    snapshot_id: faker.datatype.number(),
    node_id: faker.datatype.uuid(),
    name: `thechinedu/revuehub-api`,
    description:
      'Review Github repositories without the need for pull requests',
    default_branch: 'main',
    last_updated: faker.date.past(),
    last_synced: faker.date.recent(),
    has_pulled_content: false,
  };
}

export async function seed(knex: Knex): Promise<void> {
  await knex('users').del();
  await knex('repositories').del();

  const user = (await knex('users').insert(getUserDto()).returning(['id']))[0];

  await knex('repositories').insert(getRepositoryDto(user.id));
}
