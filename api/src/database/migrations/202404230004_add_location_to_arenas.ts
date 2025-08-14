import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('arenas', table => {
    table.string('location').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('arenas', table => {
    table.dropColumn('location');
  });
}
