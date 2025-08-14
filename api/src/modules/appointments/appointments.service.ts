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
