import { Knex } from 'knex';

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  return knex.schema.createTable('repositories', (table) => {
    table.increments();
    table.integer('snapshot_id').unsigned().unique();
    table.integer('node_id').unsigned().unique();
    table.integer('user_id').unsigned();
    table.string('name').unique();
    table.text('description');
    table.string('default_branch').notNullable();
    table.timestamp('last_updated');
    table.timestamp('last_synced');
    table.boolean('has_pulled_content').defaultTo(false);

    table.foreign('user_id').references('users.id');
  });
}

export async function down(knex: Knex): Promise<Knex.SchemaBuilder> {
  return knex.schema.dropTable('repositories');
}
