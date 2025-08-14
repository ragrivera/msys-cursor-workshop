import React from "react";
import {
  Trophy,
  Plus,
  Filter,
  Search,
  Calendar,
  Users,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TournamentBracket } from "./components/_TournamentBracket";
import { TournamentFormDialog } from "./components/_TournamentFormDialog";
import { BookingCalendar } from "@/components/_BookingCalendar";
import { useTournamentsQuery } from "./hooks/_useTournamentsQuery";

// Mock tournament data
const mockTournaments = [
  {
    id: "t1",
    name: "Spring Championship 2024",
    status: "active" as const,
    startDate: new Date("2024-04-15"),
    endDate: new Date("2024-04-20"),
    participants: 32,
    maxParticipants: 32,
    arenaName: "Battle Dome",
    prize: "$500",
    format: "Single Elimination",
    registrationDeadline: new Date("2024-04-10"),
  },
  {
    id: "t2",
    name: "Weekly Practice Tournament",
    status: "upcoming" as const,
    startDate: new Date("2024-04-22"),
    endDate: new Date("2024-04-22"),
    participants: 8,
    maxParticipants: 16,
    arenaName: "Training Ground",
    prize: "$100",
    format: "Round Robin",
    registrationDeadline: new Date("2024-04-20"),
  },
  {
    id: "t3",
    name: "Beginner's Cup",
    status: "completed" as const,
    startDate: new Date("2024-04-01"),
    endDate: new Date("2024-04-03"),
    participants: 16,
    maxParticipants: 16,
    arenaName: "Mini Arena",
    prize: "$200",
    format: "Double Elimination",
    registrationDeadline: new Date("2024-03-28"),
  },
];

const mockCalendarEvents = [
  {
    id: "e1",
    title: "Spring Championship - Finals",
    startTime: new Date("2024-04-20T15:00:00"),
    endTime: new Date("2024-04-20T18:00:00"),
    arenaId: 1,
    arenaName: "Battle Dome",
    participantCount: 32,
    maxParticipants: 32,
    status: "scheduled" as const,
  },
  {
    id: "e2",
    title: "Practice Tournament",
    startTime: new Date("2024-04-22T10:00:00"),
    endTime: new Date("2024-04-22T14:00:00"),
    arenaId: 2,
    arenaName: "Training Ground",
    participantCount: 8,
    maxParticipants: 16,
    status: "scheduled" as const,
  },
];

export default function TournamentsLayout() {
  const [view, setView] = React.useState<"list" | "calendar" | "bracket">(
    "list"
  );
  const [selectedTournament, setSelectedTournament] = React.useState<
    string | null
  >(null);

  const { data: tournaments = [], isLoading, error } = useTournamentsQuery();

  const getStatusColor = (
    status: "active" | "upcoming" | "completed" | "cancelled"
  ) => {
    switch (status) {
      case "active":
        return "default";
      case "upcoming":
        return "secondary";
      case "completed":
        return "success";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const activeTournaments = tournaments.filter(
    (t) => t.status === "active"
  ).length;
  const upcomingTournaments = tournaments.filter(
    (t) => t.status === "upcoming"
  ).length;
  const totalParticipants = tournaments.reduce(
    (sum, t) => sum + (t.participant_count || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            Tournament Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize and manage Beyblade tournaments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
          <TournamentFormDialog
            onSubmit={(data) => console.log("New tournament:", data)}
          />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Tournaments
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTournaments}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTournaments}</div>
            <p className="text-xs text-muted-foreground">Scheduled soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Participants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground">
              Across all tournaments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prize Pool</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$800</div>
            <p className="text-xs text-muted-foreground">Total available</p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={view === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("list")}
        >
          List View
        </Button>
        <Button
          variant={view === "calendar" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("calendar")}
        >
          Calendar View
        </Button>
        <Button
          variant={view === "bracket" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("bracket")}
        >
          Bracket View
        </Button>
      </div>

      {/* Content based on view */}
      {view === "list" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : tournaments.length === 0 ? (
            // Empty state
            <div className="col-span-full text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No tournaments yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first tournament to get started
              </p>
              <TournamentFormDialog />
            </div>
          ) : (
            tournaments.map((tournament) => (
              <Card
                key={tournament.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{tournament.name}</CardTitle>
                    <Badge variant={getStatusColor(tournament.status)}>
                      {tournament.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(tournament.start_date).toLocaleDateString()} -{" "}
                        {new Date(tournament.end_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {tournament.arena_name ||
                          `Arena ${tournament.arena_id}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {tournament.participant_count || 0}/
                        {tournament.max_participants} participants
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Registration</span>
                        <span className="font-medium">
                          {(
                            (tournament.participant_count ||
                              0 / tournament.max_participants) * 100
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{
                            width: `${
                              (tournament.participant_count ||
                                0 / tournament.max_participants) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Prize: </span>
                        <span className="font-medium">{tournament.prize}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Format: </span>
                        <span className="font-medium">{tournament.format}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      variant={
                        tournament.status === "active" ? "default" : "outline"
                      }
                      onClick={() =>
                        setSelectedTournament(tournament.id.toString())
                      }
                    >
                      {tournament.status === "active"
                        ? "Manage"
                        : "View Details"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {view === "calendar" && (
        <BookingCalendar
          events={mockCalendarEvents}
          onDateSelect={(date) => console.log("Selected date:", date)}
          onEventClick={(event) => console.log("Clicked event:", event)}
          onAddEvent={(date) => console.log("Add event on:", date)}
        />
      )}

      {view === "bracket" && selectedTournament && (
        <TournamentBracket
          tournamentName="Spring Championship 2024"
          matches={[
            {
              id: "r1m1",
              player1: "Valt Aoi",
              player2: "Shu Kurenai",
              winner: "Valt Aoi",
              score: "3-1",
              status: "completed",
              round: 1,
              position: 1,
            },
            {
              id: "r1m2",
              player1: "Lui Shirasagijo",
              player2: "Free De La Hoya",
              status: "in-progress",
              round: 1,
              position: 2,
            },
            {
              id: "r1m3",
              player1: "Zac Kaneguro",
              player2: "Xander Shakadera",
              winner: "Xander Shakadera",
              score: "3-2",
              status: "completed",
              round: 1,
              position: 3,
            },
            {
              id: "r1m4",
              player1: "Ken Midori",
              player2: "Daigo Kurogami",
              status: "upcoming",
              round: 1,
              position: 4,
            },
            {
              id: "r2m1",
              player1: "Valt Aoi",
              player2: undefined,
              status: "upcoming",
              round: 2,
              position: 1,
            },
            {
              id: "r2m2",
              player1: "Xander Shakadera",
              player2: undefined,
              status: "upcoming",
              round: 2,
              position: 2,
            },
            {
              id: "r3m1",
              status: "upcoming",
              round: 3,
              position: 1,
            },
          ]}
        />
      )}
    </div>
  );
}
