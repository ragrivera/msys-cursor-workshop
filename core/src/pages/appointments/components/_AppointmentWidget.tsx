import React from "react";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Users, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppointmentsQuery } from "../hooks/_useAppointmentsQuery";
import { useBookAppointment } from "../hooks/_useBookAppointment";

interface AppointmentWidgetProps {
  className?: string;
}

export const AppointmentWidget: React.FC<AppointmentWidgetProps> = ({
  className = "",
}) => {
  const { data: appointments, isLoading } = useAppointmentsQuery();
  const bookMutation = useBookAppointment();

  const handleBook = (appointmentId: number) => {
    bookMutation.mutate({
      appointmentId,
      participantId: 1, // Demo participant ID
    });
  };

  if (isLoading) {
    return (
      <div className={`p-6 border rounded-lg bg-card ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 border rounded-lg bg-card shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Upcoming Tournaments</h3>
      </div>

      {!appointments?.length ? (
        <p className="text-muted-foreground text-center py-8">
          No appointments scheduled
        </p>
      ) : (
        <div className="space-y-4">
          {appointments.slice(0, 3).map((appointment) => (
            <div
              key={appointment.id}
              className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-foreground">
                  {appointment.title}
                </h4>
                <Button
                  size="sm"
                  onClick={() => handleBook(appointment.id)}
                  disabled={bookMutation.isPending}
                  className="ml-2"
                >
                  {bookMutation.isPending ? "Booking..." : "Book"}
                </Button>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(appointment.start_time), "MMM dd, yyyy")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {format(new Date(appointment.start_time), "HH:mm")} -{" "}
                    {format(new Date(appointment.end_time), "HH:mm")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Arena {appointment.arena_id}</span>
                </div>

                {appointment.description && (
                  <div className="flex items-start gap-2 mt-2">
                    <Users className="h-4 w-4 mt-0.5" />
                    <span className="text-xs">{appointment.description}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
