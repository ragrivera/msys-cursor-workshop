import { db } from '@/database';
import {
  getAppointmentById,
  getRemainingCapacity,
  participantHasClash,
} from '@/modules/appointments/appointments.service';

export type BookingStatus =
  | 'booked'
  | 'waitlisted'
  | 'cancelled'
  | 'checked_in';

export interface Booking {
  id: number;
  appointment_id: number;
  participant_id: number;
  status: BookingStatus;
}

export async function bookAppointment(
  appointmentId: number,
  participantId: number
): Promise<Booking> {
  // Ensure appointment exists
  const appointment = await getAppointmentById(appointmentId);
  if (!appointment) throw new Error('Appointment not found');

  // Check for time clash
  if (
    await participantHasClash(
      participantId,
      appointment.start_time,
      appointment.end_time
    )
  ) {
    throw new Error('Participant has a conflicting booking');
  }

  // Determine status based on capacity
  const remaining = await getRemainingCapacity(appointmentId);
  const status: BookingStatus = remaining > 0 ? 'booked' : 'waitlisted';

  const [booking] = await db<Booking>('bookings')
    .insert({
      appointment_id: appointmentId,
      participant_id: participantId,
      status,
    })
    .returning('*');
  return booking;
}

export async function cancelBooking(
  bookingId: number
): Promise<Booking | undefined> {
  const [updated] = await db<Booking>('bookings')
    .where({ id: bookingId })
    .update({ status: 'cancelled', updated_at: db.fn.now() })
    .returning('*');

  if (updated?.status === 'cancelled') {
    // Promote next waitlisted participant, if any
    await promoteWaitlist(updated.appointment_id);
  }
  return updated;
}

export async function checkIn(bookingId: number): Promise<Booking | undefined> {
  const [updated] = await db<Booking>('bookings')
    .where({ id: bookingId })
    .update({ status: 'checked_in', updated_at: db.fn.now() })
    .returning('*');
  return updated;
}

export async function promoteWaitlist(appointmentId: number): Promise<void> {
  const remaining = await getRemainingCapacity(appointmentId);
  if (remaining <= 0) return;

  const waitlisted = await db<Booking>('bookings')
    .where({ appointment_id: appointmentId, status: 'waitlisted' })
    .orderBy('created_at', 'asc')
    .limit(remaining);

  if (waitlisted.length === 0) return;

  await db<Booking>('bookings')
    .whereIn(
      'id',
      waitlisted.map(w => w.id)
    )
    .update({ status: 'booked', updated_at: db.fn.now() });
}
