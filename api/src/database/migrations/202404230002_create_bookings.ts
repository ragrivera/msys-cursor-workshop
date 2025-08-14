import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('bookings', table => {
    table.increments('id').primary();
    table
      .integer('appointment_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('appointments')
      .onDelete('CASCADE');
    table
      .integer('participant_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('participants')
      .onDelete('CASCADE');
    table
      .enum('status', ['booked', 'waitlisted', 'cancelled', 'checked_in'])
      .notNullable()
      .defaultTo('booked');
    table.timestamps(true, true);

    table.unique(['appointment_id', 'participant_id']);
  });

  // Index to quickly count active bookings
  await knex.schema.alterTable('bookings', table => {
    table.index(['appointment_id', 'status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('bookings');
}

