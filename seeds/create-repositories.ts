import { faker } from '@faker-js/faker';
import { Knex } from 'knex';

// table.increments();
// table.string('email', 255).unique();
// table.string('username', 255).unique();
// table.string('password_digest', 128);
// table.boolean('email_verified').defaultTo(false);
// table.string('provider', 255).defaultTo(''); // TODO: Move to a separate table. A user can potentially have multiple oauth providers (only github supported for now but other providers might be supported in the future (gitlab, google, twitter etc))
// table.string('full_name', 255).defaultTo('');
// table.string('profile_image_url', 255);
// table.timestamps(false, true);
function createUser() {
  return {
    email: faker.internet.email(),
    username: faker.internet.userName(),
    full_name: faker.name.fullName(),
  };
}

function createRepository(user_id: number) {
  return {
    user_id,
    snapshot_id: faker.datatype.number(),
    node_id: faker.datatype.uuid(),
    name: `thechinedu/revuehub-api`,
    description: faker.company.catchPhrase(),
    default_branch: 'main',
    last_updated: faker.date.past(),
    last_synced: faker.date.recent(),
    has_pulled_content: false,
  };
}

export async function seed(knex: Knex): Promise<void> {
  await knex('users').del();
  await knex('repositories').del();

  const user = (await knex('users').insert(createUser()).returning(['id']))[0];

  await knex('repositories').insert(createRepository(user.id));
}
