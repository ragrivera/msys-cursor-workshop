import React from "react";
import { Trophy, User, Crown, Swords } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Match {
  id: string;
  player1?: string;
  player2?: string;
  winner?: string;
  score?: string;
  status: "upcoming" | "in-progress" | "completed";
  round: number;
  position: number;
}

interface TournamentBracketProps {
  matches: Match[];
  tournamentName: string;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  matches,
  tournamentName,
}) => {
  const rounds = Math.max(...matches.map((m) => m.round));

  const getMatchesByRound = (round: number) => {
    return matches
      .filter((m) => m.round === round)
      .sort((a, b) => a.position - b.position);
  };

  const getStatusColor = (status: Match["status"]) => {
    switch (status) {
      case "completed":
        return "success";
      case "in-progress":
        return "warning";
      case "upcoming":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getRoundName = (round: number) => {
    const totalRounds = rounds;
    if (round === totalRounds) return "Final";
    if (round === totalRounds - 1) return "Semi-Final";
    if (round === totalRounds - 2) return "Quarter-Final";
    return `Round ${round}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          {tournamentName} - Bracket
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {Array.from({ length: rounds }, (_, i) => i + 1).map((round) => (
            <div key={round} className="space-y-4">
              <div className="flex items-center gap-2">
                <Swords className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">{getRoundName(round)}</h3>
                <Badge variant="outline">
                  {getMatchesByRound(round).length} matches
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getMatchesByRound(round).map((match) => (
                  <div
                    key={match.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      match.status === "in-progress"
                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                        : match.status === "completed"
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium">
                        Match {match.position}
                      </span>
                      <Badge
                        variant={getStatusColor(match.status)}
                        className="text-xs"
                      >
                        {match.status.replace("-", " ")}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {/* Player 1 */}
                      <div
                        className={`flex items-center gap-2 p-2 rounded ${
                          match.winner === match.player1
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-muted/50"
                        }`}
                      >
                        <User className="h-4 w-4" />
                        <span className="font-medium">
                          {match.player1 || "TBD"}
                        </span>
                        {match.winner === match.player1 && (
                          <Crown className="h-4 w-4 text-primary ml-auto" />
                        )}
                      </div>

                      {/* VS Divider */}
                      <div className="text-center text-xs text-muted-foreground font-bold">
                        VS
                      </div>

                      {/* Player 2 */}
                      <div
                        className={`flex items-center gap-2 p-2 rounded ${
                          match.winner === match.player2
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-muted/50"
                        }`}
                      >
                        <User className="h-4 w-4" />
                        <span className="font-medium">
                          {match.player2 || "TBD"}
                        </span>
                        {match.winner === match.player2 && (
                          <Crown className="h-4 w-4 text-primary ml-auto" />
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    {match.score && (
                      <div className="mt-3 text-center text-sm font-mono bg-accent/50 py-1 px-2 rounded">
                        {match.score}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
