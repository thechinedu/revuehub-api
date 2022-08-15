import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments();
    table.string('email', 255).unique();
    table.string('username', 255).unique();
    table.string('password_digest', 128);
    table.boolean('email_verified').defaultTo(false);
    table.string('provider', 255).defaultTo('');
    table.string('full_name', 255).defaultTo('');
    table.string('profile_image_url', 255);
    table.timestamps(false, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
