import React from "react";
import { MapPin, Users, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Arena {
  id: number;
  name: string;
  capacity: number;
  currentBookings: number;
  status: "active" | "maintenance" | "closed";
  nextEvent?: {
    title: string;
    time: string;
  };
}

interface ArenaStatusCardProps {
  arena: Arena;
  onManage?: (arenaId: number) => void;
}

export const ArenaStatusCard: React.FC<ArenaStatusCardProps> = ({
  arena,
  onManage,
}) => {
  const utilizationPercent = (arena.currentBookings / arena.capacity) * 100;

  const getStatusColor = (status: Arena["status"]) => {
    switch (status) {
      case "active":
        return "success";
      case "maintenance":
        return "warning";
      case "closed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: Arena["status"]) => {
    switch (status) {
      case "active":
        return <Zap className="h-4 w-4" />;
      case "maintenance":
        return <Clock className="h-4 w-4" />;
      case "closed":
        return <MapPin className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          {arena.name}
        </CardTitle>
        <Badge variant={getStatusColor(arena.status)} className="gap-1">
          {getStatusIcon(arena.status)}
          {arena.status.charAt(0).toUpperCase() + arena.status.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Capacity Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Capacity</span>
              <span className="font-medium">
                {arena.currentBookings}/{arena.capacity}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  utilizationPercent > 80
                    ? "bg-destructive"
                    : utilizationPercent > 60
                    ? "bg-yellow-500"
                    : "bg-primary"
                }`}
                style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {utilizationPercent.toFixed(1)}% utilized
            </div>
          </div>

          {/* Next Event */}
          {arena.nextEvent && (
            <div className="p-3 bg-accent/50 rounded-md">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  Next: {arena.nextEvent.title}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {arena.nextEvent.time}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{arena.capacity} max</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span>{arena.status === "active" ? "Live" : "Offline"}</span>
            </div>
          </div>

          {/* Action Button */}
          {onManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManage(arena.id)}
              className="w-full"
            >
              Manage Arena
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
