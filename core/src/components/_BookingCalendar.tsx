import React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  arenaId: number;
  arenaName: string;
  participantCount: number;
  maxParticipants: number;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
}

interface BookingCalendarProps {
  events: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: (date: Date) => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  events,
  onDateSelect,
  onEventClick,
  onAddEvent,
}) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.startTime, date));
  };

  const getStatusColor = (status: CalendarEvent["status"]) => {
    switch (status) {
      case "scheduled":
        return "default";
      case "in-progress":
        return "warning";
      case "completed":
        return "success";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Tournament Calendar
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold min-w-[140px] text-center">
                {format(currentDate, "MMMM yyyy")}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dayEvents = getEventsForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isDayToday = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[80px] p-1 border rounded-md cursor-pointer transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : isDayToday
                      ? "border-primary/50 bg-primary/5"
                      : "border-border hover:bg-accent/50"
                  } ${!isSameMonth(day, currentDate) ? "opacity-30" : ""}`}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`text-sm font-medium ${
                        isDayToday
                          ? "text-primary font-bold"
                          : "text-foreground"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {onAddEvent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddEvent(day);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded bg-card border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <Badge
                            variant={getStatusColor(event.status)}
                            className="w-2 h-2 p-0"
                          />
                          <span className="truncate font-medium">
                            {event.title}
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          {format(event.startTime, "HH:mm")}
                        </div>
                      </div>
                    ))}

                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
              <Badge variant="secondary" className="ml-auto">
                {getEventsForDate(selectedDate).length} events
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getEventsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No events scheduled for this date</p>
                {onAddEvent && (
                  <Button
                    variant="outline"
                    className="mt-4 gap-2"
                    onClick={() => onAddEvent(selectedDate)}
                  >
                    <Plus className="h-4 w-4" />
                    Schedule Event
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {getEventsForDate(selectedDate)
                  .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                  .map((event) => (
                    <div
                      key={event.id}
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => onEventClick?.(event)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-foreground">
                            {event.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {event.arenaName}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(event.status)}>
                          {event.status.replace("-", " ")}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(event.startTime, "HH:mm")} -{" "}
                            {format(event.endTime, "HH:mm")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {event.participantCount}/{event.maxParticipants}
                          </span>
                        </div>
                      </div>

                      {/* Capacity Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-secondary rounded-full h-1">
                          <div
                            className={`h-1 rounded-full transition-all ${
                              (event.participantCount / event.maxParticipants) *
                                100 >
                              80
                                ? "bg-destructive"
                                : (event.participantCount /
                                    event.maxParticipants) *
                                    100 >
                                  60
                                ? "bg-yellow-500"
                                : "bg-primary"
                            }`}
                            style={{
                              width: `${Math.min(
                                (event.participantCount /
                                  event.maxParticipants) *
                                  100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
