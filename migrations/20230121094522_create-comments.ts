import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('comments', (table) => {
    table.increments();
    table.integer('user_id').unsigned();
    table.integer('repository_blob_id').unsigned();
    table.integer('parent_comment_id').unsigned().nullable();
    table.text('content').notNullable();
    table.integer('start_line');
    table.integer('end_line');
    table.integer('insertion_pos');
    table
      .enum('status', ['PENDING', 'PUBLISHED', 'RESOLVED'])
      .defaultTo('PENDING');
    table.timestamps(false, true);
    table.enum('level', ['LINE', 'FILE', 'PROJECT']);

    table.foreign('user_id').references('users.id');
    table.foreign('repository_blob_id').references('repository_blobs.id');
    table.foreign('parent_comment_id').references('comments.id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('comments');
}
