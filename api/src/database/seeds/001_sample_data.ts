import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('payments').del();
  await knex('appointments').del();
  await knex('participants').del();
  await knex('arenas').del();

  // Arenas
  const [battleDomeId, trainingGroundId] = await knex('arenas')
    .insert([
      { name: 'Battle Dome', capacity: 32 },
      { name: 'Training Ground', capacity: 16 },
    ])
    .returning<'arenas', { id: number }[]>('id')
    .then(rows => rows.map(r => r.id));

  // Participants
  const participantRows = await knex('participants')
    .insert([
      { name: 'Valt Aoi', email: 'valt@example.com' },
      { name: 'Shu Kurenai', email: 'shu@example.com' },
    ])
    .returning<'participants', { id: number }[]>('id');
  const [valtId, shuId] = participantRows.map(r => r.id);

  // Appointments
  const now = new Date();
  const appointmentRows = await knex('appointments')
    .insert([
      {
        arena_id: battleDomeId,
        start_time: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        title: 'Quarter Finals',
        description: 'Top 8 players face off.',
      },
      {
        arena_id: trainingGroundId,
        start_time: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
        title: 'Practice Session',
        description: 'Open practice for newcomers.',
      },
    ])
    .returning<'appointments', { id: number }[]>('id');

  const [quarterFinalId] = appointmentRows.map(r => r.id);

  // Payments (only for first appointment)
  await knex('payments').insert([
    {
      appointment_id: quarterFinalId,
      amount_cents: 2500,
      status: 'succeeded',
      provider: 'stripe',
      provider_reference: 'pi_1ABC1234',
    },
  ]);

  // Bookings
  await knex('bookings').insert([
    {
      appointment_id: quarterFinalId,
      participant_id: valtId,
      status: 'booked',
    },
    { appointment_id: quarterFinalId, participant_id: shuId, status: 'booked' },
  ]);
}
