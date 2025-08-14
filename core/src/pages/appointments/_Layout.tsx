import { format } from "date-fns";
import { Calendar, Clock, MapPin, Users, Trophy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentFormDialog } from "./components/_AppointmentFormDialog";
import { useAppointmentsQuery } from "./hooks/_useAppointmentsQuery";
import { useAuthStore } from "@/stores/auth-store";

export default function AppointmentsLayout() {
  const { data: appointments, isLoading, error } = useAppointmentsQuery();
  const { isAuthenticated, user, token } = useAuthStore();

  const handleCreateAppointment = (data: {
    arena_id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
  }) => {
    console.log("Creating appointment:", data);
    // Appointment creation is now handled by the dialog component
  };

  // Debug info
  console.log("Appointments Debug:", {
    appointmentsCount: appointments?.length,
    isAuthenticated,
    hasToken: !!token,
    userEmail: user?.email,
    isLoading,
    error: error?.message,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 border rounded-lg bg-card animate-pulse"
            >
              <div className="space-y-3">
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            Tournament Appointments
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize Beyblade tournament schedules
          </p>
        </div>
        <AppointmentFormDialog onSubmit={handleCreateAppointment} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Appointments
              </p>
              <p className="text-2xl font-bold text-foreground">
                {appointments?.length || 0}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                This Week
              </p>
              <p className="text-2xl font-bold text-foreground">
                {appointments?.filter((apt) => {
                  const startDate = new Date(apt.start_time);
                  const now = new Date();
                  const weekFromNow = new Date(
                    now.getTime() + 7 * 24 * 60 * 60 * 1000
                  );
                  return startDate >= now && startDate <= weekFromNow;
                }).length || 0}
              </p>
            </div>
            <Clock className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Arenas
              </p>
              <p className="text-2xl font-bold text-foreground">2</p>
            </div>
            <MapPin className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="border rounded-lg bg-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Scheduled Appointments
          </h2>
        </div>

        {!appointments?.length ? (
          <div className="p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No appointments scheduled
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first tournament appointment to get started
            </p>
            <AppointmentFormDialog onSubmit={handleCreateAppointment} />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-6 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {appointment.title}
                      </h3>
                      {appointment.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {appointment.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(
                            new Date(appointment.start_time),
                            "MMM dd, yyyy"
                          )}
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
                        <span>
                          {appointment.arena_id === 1
                            ? "Battle Dome"
                            : "Training Ground"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>0 / 32 participants</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
