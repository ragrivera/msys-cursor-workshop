export type Appointment = {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  arena_id: number;
  created_at: string;
  updated_at: string;
};

export type CreateAppointmentRequest = {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  arena_id: number;
};

export type BookAppointmentRequest = {
  appointmentId: number;
  participantId: number;
};
