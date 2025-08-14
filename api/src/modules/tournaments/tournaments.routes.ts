import { Router } from 'express';
import { z } from 'zod';
import { logger } from '@/utils/logger';
import {
  listTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  addParticipantToTournament,
  removeParticipantFromTournament,
  type CreateTournamentData
} from './tournaments.service';

const router = Router();

// Validation schemas
const tournamentSchema = z.object({
  name: z.string().min(1, 'Tournament name is required'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  arena_id: z.number().int().min(1, 'Arena ID is required'),
  max_participants: z.number().int().min(2, 'Must allow at least 2 participants'),
  format: z.enum(['single-elimination', 'double-elimination', 'round-robin']),
  prize: z.string().optional(),
});

const participantSchema = z.object({
  participant_id: z.number().int().min(1, 'Participant ID is required'),
});

/**
 * @swagger
 * /api/tournaments:
 *   get:
 *     summary: Get all tournaments
 *     tags: [Tournaments]
 *     responses:
 *       200:
 *         description: List of tournaments
 */
router.get('/', async (_req, res, next) => {
  try {
    const tournaments = await listTournaments();
    res.json(tournaments);
  } catch (err) {
    logger.error('Error fetching tournaments:', err);
    return next(err);
  }
});

/**
 * @swagger
 * /api/tournaments:
 *   post:
 *     summary: Create a new tournament
 *     tags: [Tournaments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - start_date
 *               - end_date
 *               - arena_id
 *               - max_participants
 *               - format
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               arena_id:
 *                 type: integer
 *               max_participants:
 *                 type: integer
 *               format:
 *                 type: string
 *                 enum: [single-elimination, double-elimination, round-robin]
 *               prize:
 *                 type: string
 */
router.post('/', async (req, res, next) => {
  try {
    const validatedData = tournamentSchema.parse(req.body);

    const tournament = await createTournament(validatedData as CreateTournamentData);

    logger.info(`Tournament created: ${tournament.name}`);
    res.status(201).json(tournament);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: err.errors,
      });
    }
    logger.error('Error creating tournament:', err);
    return next(err);
  }
});

/**
 * @swagger
 * /api/tournaments/{id}:
 *   get:
 *     summary: Get tournament by ID
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const tournament = await getTournamentById(id);

    if (!tournament) {
      return res.status(404).json({
        status: 'error',
        message: 'Tournament not found',
      });
    }

    res.json(tournament);
  } catch (err) {
    logger.error('Error fetching tournament:', err);
    return next(err);
  }
});

/**
 * @swagger
 * /api/tournaments/{id}:
 *   put:
 *     summary: Update tournament
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = tournamentSchema.partial().parse(req.body);

    const tournament = await updateTournament(id, validatedData);

    if (!tournament) {
      return res.status(404).json({
        status: 'error',
        message: 'Tournament not found',
      });
    }

    logger.info(`Tournament updated: ${tournament.name}`);
    res.json(tournament);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: err.errors,
      });
    }
    logger.error('Error updating tournament:', err);
    return next(err);
  }
});

/**
 * @swagger
 * /api/tournaments/{id}:
 *   delete:
 *     summary: Delete tournament
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await deleteTournament(id);

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Tournament not found',
      });
    }

    logger.info(`Tournament deleted: ${id}`);
    res.status(204).send();
  } catch (err) {
    logger.error('Error deleting tournament:', err);
    return next(err);
  }
});

/**
 * @swagger
 * /api/tournaments/{id}/participants:
 *   post:
 *     summary: Add participant to tournament
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.post('/:id/participants', async (req, res, next) => {
  try {
    const tournamentId = parseInt(req.params.id);
    const { participant_id } = participantSchema.parse(req.body);

    await addParticipantToTournament(tournamentId, participant_id);

    logger.info(`Participant ${participant_id} added to tournament ${tournamentId}`);
    res.status(201).json({ message: 'Participant added successfully' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: err.errors,
      });
    }
    logger.error('Error adding participant to tournament:', err);
    return next(err);
  }
});

/**
 * @swagger
 * /api/tournaments/{id}/participants/{participantId}:
 *   delete:
 *     summary: Remove participant from tournament
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete('/:id/participants/:participantId', async (req, res, next) => {
  try {
    const tournamentId = parseInt(req.params.id);
    const participantId = parseInt(req.params.participantId);

    await removeParticipantFromTournament(tournamentId, participantId);

    logger.info(`Participant ${participantId} removed from tournament ${tournamentId}`);
    res.status(204).send();
  } catch (err) {
    logger.error('Error removing participant from tournament:', err);
    return next(err);
  }
});

export default router;
