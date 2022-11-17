import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('repository_blobs', (table) => {
    table.increments();
    table.integer('repository_content_id').unsigned();
    table.text('content');
    table.timestamps(false, true);

    table.foreign('repository_content_id').references('repository_contents.id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('repository_blobs');
}
