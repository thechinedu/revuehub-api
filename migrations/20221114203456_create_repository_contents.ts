import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('repository_contents', (table) => {
    table.increments();
    table.integer('repository_id').unsigned();
    table.string('type');
    table.string('path');
    table.string('sha');
    table.timestamps(false, true);

    table.foreign('repository_id').references('repositories.id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('repository_contents');
}
