import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Tournaments table
  await knex.schema.createTable('tournaments', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.timestamp('start_date', { useTz: true }).notNullable();
    table.timestamp('end_date', { useTz: true }).notNullable();
    table
      .integer('arena_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('arenas')
      .onDelete('CASCADE');
    table.integer('max_participants').notNullable();
    table.enum('format', ['single-elimination', 'double-elimination', 'round-robin']).notNullable();
    table.string('prize');
    table.enum('status', ['upcoming', 'active', 'completed', 'cancelled']).notNullable().defaultTo('upcoming');
    table.timestamps(true, true);
  });

  // Tournament participants (many-to-many relationship)
  await knex.schema.createTable('tournament_participants', table => {
    table.increments('id').primary();
    table
      .integer('tournament_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('tournaments')
      .onDelete('CASCADE');
    table
      .integer('participant_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('participants')
      .onDelete('CASCADE');
    table.timestamp('registered_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamps(true, true);

    table.unique(['tournament_id', 'participant_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tournament_participants');
  await knex.schema.dropTableIfExists('tournaments');
}
