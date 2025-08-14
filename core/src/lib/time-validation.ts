import type { Appointment } from "@/pages/appointments/hooks/_useAppointmentsQuery";
import type { Tournament } from "@/pages/tournaments/hooks/_useCreateTournament";

export type TimeSlot = {
  start_time: string;
  end_time: string;
  arena_id: number;
  id?: number;
  title?: string;
};

/**
 * Check if two time slots overlap
 */
export const doTimeSlotsOverlap = (
  slot1: TimeSlot,
  slot2: TimeSlot
): boolean => {
  // Only check overlap if they're in the same arena
  if (slot1.arena_id !== slot2.arena_id) {
    return false;
  }

  const start1 = new Date(slot1.start_time);
  const end1 = new Date(slot1.end_time);
  const start2 = new Date(slot2.start_time);
  const end2 = new Date(slot2.end_time);

  // Check if the time ranges overlap
  // Two ranges overlap if start1 < end2 AND start2 < end1
  return start1 < end2 && start2 < end1;
};

/**
 * Check if a new appointment conflicts with existing appointments
 */
export const checkAppointmentConflicts = (
  newAppointment: {
    arena_id: number;
    start_time: string;
    end_time: string;
  },
  existingAppointments: Appointment[],
  excludeId?: number
): { hasConflict: boolean; conflictingAppointments: Appointment[] } => {
  const conflictingAppointments = existingAppointments.filter((appointment) => {
    // Exclude the appointment being edited (if any)
    if (excludeId && appointment.id === excludeId) {
      return false;
    }

    return doTimeSlotsOverlap(newAppointment, appointment);
  });

  return {
    hasConflict: conflictingAppointments.length > 0,
    conflictingAppointments,
  };
};

/**
 * Check if a new tournament conflicts with existing tournaments
 */
export const checkTournamentConflicts = (
  newTournament: {
    arena_id: number;
    start_date: string;
    end_date: string;
  },
  existingTournaments: Tournament[],
  excludeId?: number
): { hasConflict: boolean; conflictingTournaments: Tournament[] } => {
  const conflictingTournaments = existingTournaments.filter((tournament) => {
    // Exclude the tournament being edited (if any)
    if (excludeId && tournament.id === excludeId) {
      return false;
    }

    return doTimeSlotsOverlap(
      {
        arena_id: newTournament.arena_id,
        start_time: newTournament.start_date,
        end_time: newTournament.end_date,
      },
      {
        arena_id: tournament.arena_id,
        start_time: tournament.start_date,
        end_time: tournament.end_date,
      }
    );
  });

  return {
    hasConflict: conflictingTournaments.length > 0,
    conflictingTournaments,
  };
};

/**
 * Check if an appointment conflicts with existing tournaments
 */
export const checkAppointmentTournamentConflicts = (
  newAppointment: {
    arena_id: number;
    start_time: string;
    end_time: string;
  },
  existingTournaments: Tournament[]
): { hasConflict: boolean; conflictingTournaments: Tournament[] } => {
  const conflictingTournaments = existingTournaments.filter((tournament) => {
    return doTimeSlotsOverlap(newAppointment, {
      arena_id: tournament.arena_id,
      start_time: tournament.start_date,
      end_time: tournament.end_date,
    });
  });

  return {
    hasConflict: conflictingTournaments.length > 0,
    conflictingTournaments,
  };
};

/**
 * Check if a tournament conflicts with existing appointments
 */
export const checkTournamentAppointmentConflicts = (
  newTournament: {
    arena_id: number;
    start_date: string;
    end_date: string;
  },
  existingAppointments: Appointment[]
): { hasConflict: boolean; conflictingAppointments: Appointment[] } => {
  const conflictingAppointments = existingAppointments.filter((appointment) => {
    return doTimeSlotsOverlap(
      {
        arena_id: newTournament.arena_id,
        start_time: newTournament.start_date,
        end_time: newTournament.end_date,
      },
      appointment
    );
  });

  return {
    hasConflict: conflictingAppointments.length > 0,
    conflictingAppointments,
  };
};

/**
 * Validate time input (start time should be before end time)
 */
export const validateTimeOrder = (
  startTime: string,
  endTime: string
): { isValid: boolean; error?: string } => {
  if (!startTime || !endTime) {
    return { isValid: false, error: "Both start and end times are required" };
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, error: "Invalid date format" };
  }

  if (start >= end) {
    return { isValid: false, error: "Start time must be before end time" };
  }

  return { isValid: true };
};

/**
 * Validate that the event is not in the past
 */
export const validateNotInPast = (
  startTime: string,
  bufferMinutes: number = 30
): { isValid: boolean; error?: string } => {
  if (!startTime) {
    return { isValid: false, error: "Start time is required" };
  }

  const start = new Date(startTime);
  const now = new Date();
  const minStartTime = new Date(now.getTime() + bufferMinutes * 60 * 1000);

  if (isNaN(start.getTime())) {
    return { isValid: false, error: "Invalid date format" };
  }

  if (start < minStartTime) {
    return {
      isValid: false,
      error: `Event must start at least ${bufferMinutes} minutes from now`,
    };
  }

  return { isValid: true };
};

/**
 * Validate minimum duration
 */
export const validateMinimumDuration = (
  startTime: string,
  endTime: string,
  minDurationMinutes: number = 30
): { isValid: boolean; error?: string } => {
  if (!startTime || !endTime) {
    return { isValid: false, error: "Both start and end times are required" };
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, error: "Invalid date format" };
  }

  const durationMs = end.getTime() - start.getTime();
  const durationMinutes = durationMs / (1000 * 60);

  if (durationMinutes < minDurationMinutes) {
    return {
      isValid: false,
      error: `Duration must be at least ${minDurationMinutes} minutes`,
    };
  }

  return { isValid: true };
};

/**
 * Validate maximum duration
 */
export const validateMaximumDuration = (
  startTime: string,
  endTime: string,
  maxDurationHours: number = 12
): { isValid: boolean; error?: string } => {
  if (!startTime || !endTime) {
    return { isValid: false, error: "Both start and end times are required" };
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, error: "Invalid date format" };
  }

  const durationMs = end.getTime() - start.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);

  if (durationHours > maxDurationHours) {
    return {
      isValid: false,
      error: `Duration cannot exceed ${maxDurationHours} hours`,
    };
  }

  return { isValid: true };
};

/**
 * Format conflict message for display
 */
export const formatConflictMessage = (
  conflictingAppointments: Appointment[],
  conflictingTournaments: Tournament[]
): string => {
  const messages: string[] = [];

  if (conflictingAppointments.length > 0) {
    const appointmentTitles = conflictingAppointments
      .map((a) => `"${a.title}"`)
      .join(", ");
    messages.push(
      `Conflicts with appointment${
        conflictingAppointments.length > 1 ? "s" : ""
      }: ${appointmentTitles}`
    );
  }

  if (conflictingTournaments.length > 0) {
    const tournamentNames = conflictingTournaments
      .map((t) => `"${t.name}"`)
      .join(", ");
    messages.push(
      `Conflicts with tournament${
        conflictingTournaments.length > 1 ? "s" : ""
      }: ${tournamentNames}`
    );
  }

  return messages.join(". ");
};
