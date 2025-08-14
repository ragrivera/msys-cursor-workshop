import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Calendar,
  User,
  Trophy,
  AlertCircle,
  CheckCircle,
  Clock,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Activity {
  id: string;
  type:
    | "booking"
    | "cancellation"
    | "tournament_start"
    | "tournament_end"
    | "user_joined"
    | "user_left"
    | "system";
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  metadata?: {
    appointmentId?: number;
    arenaName?: string;
    participantCount?: number;
  };
}

interface LiveActivityFeedProps {
  activities?: Activity[];
  maxItems?: number;
}

// Mock activities data
const mockActivities: Activity[] = [
  {
    id: "1",
    type: "booking",
    title: "New Tournament Booking",
    description: "Alex Thunder booked Battle Dome Arena",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    user: "Alex Thunder",
    metadata: {
      appointmentId: 1,
      arenaName: "Battle Dome",
    },
  },
  {
    id: "2",
    type: "user_joined",
    title: "New Participant Joined",
    description: "Maya Blaze joined the tournament",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    user: "Maya Blaze",
    metadata: {
      participantCount: 24,
    },
  },
  {
    id: "3",
    type: "tournament_start",
    title: "Tournament Started",
    description: "Championship Bracket has begun",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    metadata: {
      arenaName: "Training Ground",
      participantCount: 16,
    },
  },
  {
    id: "4",
    type: "cancellation",
    title: "Booking Cancelled",
    description: "Luna Star cancelled their arena booking",
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    user: "Luna Star",
    metadata: {
      arenaName: "Battle Dome",
    },
  },
];

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  activities = mockActivities,
  maxItems = 10,
}) => {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-4 w-4 text-green-500" />;
      case "cancellation":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "tournament_start":
        return <Trophy className="h-4 w-4 text-primary" />;
      case "tournament_end":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "user_joined":
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case "user_left":
        return <UserMinus className="h-4 w-4 text-orange-500" />;
      case "system":
        return <Bell className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "booking":
      case "tournament_end":
        return "success";
      case "cancellation":
        return "destructive";
      case "tournament_start":
        return "default";
      case "user_joined":
        return "secondary";
      case "user_left":
        return "warning";
      default:
        return "outline";
    }
  };

  const sortedActivities = activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Live Activity Feed
          {activities.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {activities.length} events
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedActivities.map((activity, index) => (
              <div
                key={activity.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  index === 0
                    ? "bg-accent/50 border border-primary/20"
                    : "hover:bg-accent/30"
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.description}
                      </p>

                      {/* Metadata */}
                      {activity.metadata && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {activity.metadata.arenaName && (
                            <Badge variant="outline" className="text-xs">
                              {activity.metadata.arenaName}
                            </Badge>
                          )}
                          {activity.metadata.participantCount && (
                            <Badge variant="outline" className="text-xs">
                              <User className="h-3 w-3 mr-1" />
                              {activity.metadata.participantCount}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant={getActivityColor(activity.type)}
                        className="text-xs"
                      >
                        {activity.type.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(activity.timestamp, {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* User info */}
                  {activity.user && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{activity.user}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activities.length > maxItems && (
          <div className="text-center mt-4">
            <button className="text-sm text-primary hover:underline">
              View all {activities.length} activities
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
