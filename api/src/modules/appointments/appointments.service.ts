import { db } from '@/database';

export type Appointment = {
  id: number;
  arena_id: number;
  start_time: string; // ISO string
  end_time: string;
  title: string;
  description?: string | null;
};

export async function listAppointments(): Promise<Appointment[]> {
  return db<Appointment>('appointments')
    .select('*')
    .orderBy('start_time', 'asc');
}

export async function getAppointmentById(
  id: number
): Promise<Appointment | undefined> {
  return db<Appointment>('appointments').where({ id }).first();
}

export async function createAppointment(
  data: Omit<Appointment, 'id'>
): Promise<Appointment> {
  const [created] = await db<Appointment>('appointments')
    .insert(data)
    .returning('*');
  return created;
}

export async function updateAppointment(
  id: number,
  data: Partial<Omit<Appointment, 'id'>>
): Promise<Appointment | undefined> {
  const [updated] = await db<Appointment>('appointments')
    .where({ id })
    .update({ ...data, updated_at: db.fn.now() })
    .returning('*');
  return updated;
}

export async function deleteAppointment(id: number): Promise<number> {
  return db<Appointment>('appointments').where({ id }).del();
}

export async function getRemainingCapacity(
  appointmentId: number
): Promise<number> {
  const appointment = await db('appointments')
    .select('appointments.*', 'arenas.capacity')
    .join('arenas', 'appointments.arena_id', 'arenas.id')
    .where('appointments.id', appointmentId)
    .first();
  if (!appointment) return 0;
  const [{ count }] = await db('bookings')
    .where({ appointment_id: appointmentId })
    .whereIn('status', ['booked', 'checked_in'])
    .count<{ count: string }>('id as count');
  const used = Number(count);
  return appointment.capacity - used;
}

export async function participantHasClash(
  participantId: number,
  start: string,
  end: string
): Promise<boolean> {
  const clashes = await db('bookings as b')
    .join('appointments as a', 'a.id', 'b.appointment_id')
    .where('b.participant_id', participantId)
    .whereIn('b.status', ['booked', 'checked_in'])
    .whereRaw('tstzrange(a.start_time, a.end_time) && tstzrange(?, ?)', [
      start,
      end,
    ])
    .count<{ count: string }>('b.id as count');
  return Number(clashes[0].count) > 0;
}
