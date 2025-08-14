import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Ensure needed extensions (UUID & GiST over B-tree) are present
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "btree_gist"');

  // Arenas where appointments take place
  await knex.schema.createTable('arenas', table => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.integer('capacity').notNullable();
    table.timestamps(true, true);
  });

  // Participants who book appointments
  await knex.schema.createTable('participants', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.timestamps(true, true);
  });

  // Appointments scheduled within an arena
  await knex.schema.createTable('appointments', table => {
    table.increments('id').primary();
    table
      .integer('arena_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('arenas')
      .onDelete('CASCADE');
    table.timestamp('start_time', { useTz: true }).notNullable();
    table.timestamp('end_time', { useTz: true }).notNullable();
    table.string('title').notNullable();
    table.text('description');
    table.timestamps(true, true);
  });

  // Prevent overlapping bookings within the same arena
  await knex.raw(`
    ALTER TABLE appointments
    ADD CONSTRAINT no_overlapping_appointments
    EXCLUDE USING gist (
      arena_id WITH =,
      tstzrange(start_time, end_time) WITH &&
    )
  `);

  // Payments tied to appointments
  await knex.schema.createTable('payments', table => {
    table.increments('id').primary();
    table
      .integer('appointment_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('appointments')
      .onDelete('CASCADE');
    table.integer('amount_cents').notNullable();
    table.string('status').notNullable().defaultTo('pending'); // pending | succeeded | failed
    table.string('provider').notNullable().defaultTo('stripe');
    table.string('provider_reference');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('payments');
  await knex.schema.dropTableIfExists('appointments');
  await knex.schema.dropTableIfExists('participants');
  await knex.schema.dropTableIfExists('arenas');
}
