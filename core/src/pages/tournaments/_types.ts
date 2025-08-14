export type Tournament = {
  id: string;
  name: string;
  date: string;
  time: string;
  arena: string;
  participants: number;
  maxParticipants: number;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
};

export type TournamentMatch = {
  id: string;
  player1: string;
  player2: string;
  winner?: string;
  round: number;
  position: number;
};

export type TournamentBracketData = {
  matches: TournamentMatch[];
  rounds: number;
};
