export type Participant = {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalTournaments: number;
  wins: number;
  losses: number;
  winRate: number;
  status: "active" | "inactive" | "suspended";
  favoriteBeyblade?: string;
  rank: "Beginner" | "Advanced" | "Expert" | "Master";
  lastActive: string;
};

export type CreateParticipantRequest = {
  name: string;
  email: string;
  phone: string;
  favoriteBeyblade?: string;
};

export type UpdateParticipantRequest = Partial<CreateParticipantRequest> & {
  status?: Participant["status"];
  rank?: Participant["rank"];
};

export type ParticipantFilters = {
  search?: string;
  rank?: Participant["rank"] | "all";
  status?: Participant["status"] | "all";
};

export type ParticipantStats = {
  totalParticipants: number;
  activeParticipants: number;
  averageWinRate: number;
  totalMatches: number;
};
