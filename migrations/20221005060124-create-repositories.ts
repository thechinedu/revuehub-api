import { Knex } from 'knex';

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  return knex.schema.createTable('repositories', (table) => {
    table.increments();
    table.integer('snapshot_id').unsigned().unique();
    table.string('node_id').unique();
    table.integer('user_id').unsigned();
    table.string('name');
    table.text('description');
    table.string('default_branch').notNullable();
    table.timestamp('last_updated');
    table.timestamp('last_synced');
    table.boolean('has_pulled_content').defaultTo(false);

    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.unique(['user_id', 'name']);
  });
}

export async function down(knex: Knex): Promise<Knex.SchemaBuilder> {
  return knex.schema.dropTable('repositories');
}
