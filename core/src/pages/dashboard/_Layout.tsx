import { AppointmentWidget } from "@/pages/appointments/components/_AppointmentWidget";
import { LiveActivityFeed } from "@/components/_LiveActivityFeed";
import { WaitlistManager } from "@/components/_WaitlistManager";

export default function DashboardLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Beyblade Tournament Management System
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppointmentWidget />
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Tournaments</span>
              <span className="font-medium">2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registered Players</span>
              <span className="font-medium">24</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Available Arenas</span>
              <span className="font-medium">2</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveActivityFeed />
        <WaitlistManager />
      </div>
    </div>
  );
}

