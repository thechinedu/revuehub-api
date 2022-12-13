import { faker } from '@faker-js/faker';
import { Knex } from 'knex';

function createRepository() {
  return {
    snapshot_id: faker.datatype.uuid(),
    node_id: faker.datatype.uuid(),
    user_id: faker.datatype.number(),
    name: `thechinedu/revuehub-api`,
    description: faker.company.catchPhrase(),
    last_updated: faker.date.past(),
    last_synced: faker.date.recent(),
    has_pulled_content: false,
  };
}

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('repositories').del();

  // Inserts seed entries
  await knex('repositories').insert(createRepository());
}
