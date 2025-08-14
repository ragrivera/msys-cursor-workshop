import { db } from '@/database';

export type Tournament = {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  arena_id: number;
  max_participants: number;
  format: 'single-elimination' | 'double-elimination' | 'round-robin';
  prize?: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  // Joined data
  arena_name?: string;
  participant_count?: number;
};

export type CreateTournamentData = {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  arena_id: number;
  max_participants: number;
  format: 'single-elimination' | 'double-elimination' | 'round-robin';
  prize?: string;
};

export async function listTournaments(): Promise<Tournament[]> {
  const tournaments = await db('tournaments')
    .select(
      'tournaments.*',
      'arenas.name as arena_name'
    )
    .leftJoin('arenas', 'tournaments.arena_id', 'arenas.id')
    .orderBy('tournaments.start_date', 'desc');

  // Get participant counts for each tournament
  const tournamentIds = tournaments.map(t => t.id);
  const participantCounts = await db('tournament_participants')
    .select('tournament_id')
    .count('* as count')
    .whereIn('tournament_id', tournamentIds)
    .groupBy('tournament_id');

  const countMap = participantCounts.reduce((acc, item) => {
    acc[item.tournament_id] = parseInt(item.count as string);
    return acc;
  }, {} as Record<number, number>);

  return tournaments.map(tournament => ({
    ...tournament,
    participant_count: countMap[tournament.id] || 0
  }));
}

export async function getTournamentById(id: number): Promise<Tournament | null> {
  const tournament = await db('tournaments')
    .select(
      'tournaments.*',
      'arenas.name as arena_name'
    )
    .leftJoin('arenas', 'tournaments.arena_id', 'arenas.id')
    .where('tournaments.id', id)
    .first();

  if (!tournament) {
    return null;
  }

  // Get participant count
  const participantCount = await db('tournament_participants')
    .count('* as count')
    .where('tournament_id', id)
    .first();

  return {
    ...tournament,
    participant_count: parseInt(participantCount?.count as string) || 0
  };
}

export async function createTournament(data: CreateTournamentData): Promise<Tournament> {
  const [tournament] = await db('tournaments')
    .insert(data)
    .returning('*');

  // Get the tournament with arena name
  const fullTournament = await getTournamentById(tournament.id);
  return fullTournament!;
}

export async function updateTournament(id: number, data: Partial<CreateTournamentData>): Promise<Tournament | null> {
  const [tournament] = await db('tournaments')
    .where('id', id)
    .update({
      ...data,
      updated_at: db.fn.now()
    })
    .returning('*');

  if (!tournament) {
    return null;
  }

  // Get the tournament with arena name
  const fullTournament = await getTournamentById(tournament.id);
  return fullTournament!;
}

export async function deleteTournament(id: number): Promise<boolean> {
  const deletedCount = await db('tournaments')
    .where('id', id)
    .del();

  return deletedCount > 0;
}

export async function addParticipantToTournament(tournamentId: number, participantId: number): Promise<void> {
  await db('tournament_participants').insert({
    tournament_id: tournamentId,
    participant_id: participantId
  });
}

export async function removeParticipantFromTournament(tournamentId: number, participantId: number): Promise<void> {
  await db('tournament_participants')
    .where('tournament_id', tournamentId)
    .where('participant_id', participantId)
    .del();
}
