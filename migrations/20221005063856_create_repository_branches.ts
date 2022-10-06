import { Knex } from 'knex';

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  return knex.schema.createTable('repository_branches', (table) => {
    table.increments();
    table.integer('repository_id').unsigned();
    table.string('name').unique();
    table.timestamps(false, true);

    table.foreign('repository_id').references('repositories.id');
  });
}

export async function down(knex: Knex): Promise<Knex.SchemaBuilder> {
  return knex.schema.dropTable('repository_branches');
}
