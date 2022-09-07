import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user_auth_tokens', (table) => {
    table.increments();
    table.integer('user_id').unsigned();
    table.string('token').unique();
    table
      .enum('type', ['OAUTH_TOKEN', 'REFRESH_TOKEN'])
      .defaultTo('REFRESH_TOKEN');
    table.timestamp('expires_at');
    table.boolean('is_valid').defaultTo(true);
    table.timestamps(false, true);

    table.foreign('user_id').references('users.id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user_auth_tokens');
}
