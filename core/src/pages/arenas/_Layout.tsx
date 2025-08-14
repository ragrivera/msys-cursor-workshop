import React from "react";
import { MapPin, Plus, Settings, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArenaStatusCard } from "./components/_ArenaStatusCard";
import { ArenaFormDialog } from "./components/_ArenaFormDialog";
import { useArenasQuery } from "./hooks/_useArenasQuery";

// Mock data - replace with real API calls
const mockArenas = [
  {
    id: 1,
    name: "Battle Dome",
    capacity: 32,
    currentBookings: 28,
    status: "active" as const,
    nextEvent: {
      title: "Quarter Finals",
      time: "Today at 3:00 PM",
    },
  },
  {
    id: 2,
    name: "Training Ground",
    capacity: 16,
    currentBookings: 8,
    status: "active" as const,
    nextEvent: {
      title: "Practice Session",
      time: "Tomorrow at 10:00 AM",
    },
  },
  {
    id: 3,
    name: "Championship Arena",
    capacity: 64,
    currentBookings: 0,
    status: "maintenance" as const,
  },
  {
    id: 4,
    name: "Mini Arena",
    capacity: 8,
    currentBookings: 8,
    status: "active" as const,
    nextEvent: {
      title: "Beginner Tournament",
      time: "Today at 1:00 PM",
    },
  },
];

export default function ArenasLayout() {
  const { data: arenas = [], isLoading, error } = useArenasQuery();

  console.log("ArenasLayout render - arenas data:", arenas);

  const handleManageArena = (arenaId: number) => {
    console.log("Managing arena:", arenaId);
    // TODO: Navigate to arena management page
  };

  // Convert query data to match the expected structure with mock fields for display
  const displayArenas = React.useMemo(
    () =>
      arenas.map((arena) => ({
        ...arena,
        currentBookings: 0, // New arenas start with no bookings
        status: "active" as const, // All arenas are active for now
        nextEvent: {
          title: "Next Tournament",
          time: "Coming Soon",
        },
      })),
    [arenas]
  );

  const totalCapacity = displayArenas.reduce(
    (sum, arena) => sum + arena.capacity,
    0
  );
  const totalBookings = displayArenas.reduce(
    (sum, arena) => sum + arena.currentBookings,
    0
  );
  const activeArenas = displayArenas.filter(
    (arena) => arena.status === "active"
  ).length;
  const utilizationRate =
    totalCapacity > 0
      ? ((totalBookings / totalCapacity) * 100).toFixed(1)
      : "0";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">Failed to load arenas</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Retry
          </Button>
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
            <MapPin className="h-8 w-8 text-primary" />
            Arena Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage tournament arenas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <ArenaFormDialog
            onSubmit={(data) => console.log("New arena:", data)}
          />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Arenas
              </p>
              <p className="text-2xl font-bold text-foreground">
                {mockArenas.length}
              </p>
            </div>
            <MapPin className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Arenas
              </p>
              <p className="text-2xl font-bold text-foreground">
                {activeArenas}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-green-500" />
            </div>
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Capacity
              </p>
              <p className="text-2xl font-bold text-foreground">
                {totalCapacity}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Utilization Rate
              </p>
              <p className="text-2xl font-bold text-foreground">
                {utilizationRate}%
              </p>
            </div>
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                parseFloat(utilizationRate) > 80
                  ? "bg-red-100 dark:bg-red-900"
                  : parseFloat(utilizationRate) > 60
                  ? "bg-yellow-100 dark:bg-yellow-900"
                  : "bg-green-100 dark:bg-green-900"
              }`}
            >
              <div
                className={`h-4 w-4 rounded-full ${
                  parseFloat(utilizationRate) > 80
                    ? "bg-red-500"
                    : parseFloat(utilizationRate) > 60
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Arena Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayArenas.map((arena) => (
          <ArenaStatusCard
            key={arena.id}
            arena={arena}
            onManage={handleManageArena}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="border rounded-lg bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ArenaFormDialog
            onSubmit={(data) =>
              console.log("New arena from quick actions:", data)
            }
          >
            <Button
              variant="outline"
              className="justify-start gap-2 h-auto p-4"
            >
              <Plus className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Create New Arena</div>
                <div className="text-sm text-muted-foreground">
                  Add a new tournament venue
                </div>
              </div>
            </Button>
          </ArenaFormDialog>

          <Button variant="outline" className="justify-start gap-2 h-auto p-4">
            <Settings className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Bulk Configuration</div>
              <div className="text-sm text-muted-foreground">
                Configure multiple arenas
              </div>
            </div>
          </Button>

          <Button variant="outline" className="justify-start gap-2 h-auto p-4">
            <BarChart3 className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Usage Analytics</div>
              <div className="text-sm text-muted-foreground">
                View detailed usage reports
              </div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
