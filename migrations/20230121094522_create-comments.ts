import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('comments', (table) => {
    table.increments();
    table.integer('user_id').unsigned().notNullable();
    table.text('snippet').nullable();
    table.string('file_path').nullable();
    table.integer('repository_id').unsigned().notNullable();
    table.integer('parent_comment_id').unsigned().nullable();
    table
      .increments('review_summary_id', { primaryKey: false })
      .unsigned()
      .notNullable();
    table.text('content').notNullable();
    table.integer('start_line').nullable();
    table.integer('end_line').nullable();
    table.integer('insertion_pos').nullable();
    table
      .enum('status', ['PENDING', 'PUBLISHED', 'RESOLVED'])
      .defaultTo('PENDING');
    table.enum('level', ['LINE', 'FILE', 'PROJECT']).notNullable();
    table.timestamps(false, true);

    table.foreign('user_id').references('users.id');
    table.foreign('repository_id').references('repositories.id');
    table
      .foreign('parent_comment_id')
      .references('comments.id')
      .onDelete('set null');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('comments');
}
