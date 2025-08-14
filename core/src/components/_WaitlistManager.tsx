import React from "react";
import {
  Clock,
  User,
  ArrowUp,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface WaitlistEntry {
  id: string;
  participantName: string;
  email: string;
  appointmentTitle: string;
  position: number;
  waitingSince: Date;
  priority: "normal" | "high" | "urgent";
}

interface WaitlistManagerProps {
  entries?: WaitlistEntry[];
  onPromote?: (entryId: string) => void;
  onRemove?: (entryId: string) => void;
  onNotify?: (entryId: string) => void;
}

// Mock waitlist data
const mockEntries: WaitlistEntry[] = [
  {
    id: "w1",
    participantName: "Kai Storm",
    email: "kai@example.com",
    appointmentTitle: "Championship Finals",
    position: 1,
    waitingSince: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    priority: "urgent",
  },
  {
    id: "w2",
    participantName: "Luna Star",
    email: "luna@example.com",
    appointmentTitle: "Battle Dome Training",
    position: 2,
    waitingSince: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    priority: "high",
  },
  {
    id: "w3",
    participantName: "Zara Lightning",
    email: "zara@example.com",
    appointmentTitle: "Practice Session",
    position: 3,
    waitingSince: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    priority: "normal",
  },
];

export const WaitlistManager: React.FC<WaitlistManagerProps> = ({
  entries = mockEntries,
  onPromote,
  onRemove,
  onNotify,
}) => {
  const getPriorityColor = (priority: WaitlistEntry["priority"]) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "warning";
      case "normal":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getPriorityIcon = (priority: WaitlistEntry["priority"]) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-3 w-3" />;
      case "high":
        return <Clock className="h-3 w-3" />;
      case "normal":
        return <User className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const formatWaitTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const sortedEntries = entries.sort((a, b) => {
    // Sort by priority first, then by position
    const priorityOrder = { urgent: 0, high: 1, normal: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.position - b.position;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Waitlist Management
          {entries.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {entries.length} waiting
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No participants on waitlist</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedEntries.map((entry) => (
              <div
                key={entry.id}
                className={`p-4 border rounded-lg transition-colors ${
                  entry.priority === "urgent"
                    ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                    : entry.priority === "high"
                    ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
                    : "border-border bg-card hover:bg-accent/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-primary">
                          #{entry.position}
                        </span>
                        <Badge
                          variant={getPriorityColor(entry.priority)}
                          className="gap-1"
                        >
                          {getPriorityIcon(entry.priority)}
                          {entry.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        {entry.participantName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {entry.email}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {entry.appointmentTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Waiting {formatWaitTime(entry.waitingSince)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {onPromote && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onPromote(entry.id)}
                        className="gap-1"
                      >
                        <ArrowUp className="h-3 w-3" />
                        Promote
                      </Button>
                    )}

                    {onNotify && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onNotify(entry.id)}
                        className="gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Notify
                      </Button>
                    )}

                    {onRemove && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onRemove(entry.id)}
                        className="gap-1"
                      >
                        <X className="h-3 w-3" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress indicator for position */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Queue Position</span>
                    <span>
                      {entry.position} of {entries.length}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1">
                    <div
                      className="h-1 rounded-full bg-primary transition-all"
                      style={{
                        width: `${
                          ((entries.length - entry.position + 1) /
                            entries.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bulk Actions */}
        {entries.length > 0 && (
          <div className="flex gap-2 mt-6 pt-4 border-t border-border">
            <Button variant="outline" size="sm" className="gap-1">
              <CheckCircle className="h-4 w-4" />
              Notify All
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowUp className="h-4 w-4" />
              Auto-Promote
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
