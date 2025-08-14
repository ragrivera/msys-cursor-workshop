import { Router } from 'express';
import { z } from 'zod';
import { db } from '@/database';
import { logger } from '@/utils/logger';

const router = Router();

// Validation schemas
const participantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
});

const bookingSchema = z.object({
  appointment_id: z.number().int(),
  participant_id: z.number().int(),
});

/**
 * @swagger
 * /api/participants:
 *   get:
 *     summary: Get all participants
 *     tags: [Participants]
 *     responses:
 *       200:
 *         description: List of participants
 */
router.get('/', async (_req, res, next) => {
  try {
    const participants = await db('participants').select('*').orderBy('name');
    res.json(participants);
  } catch (err) {
    logger.error('Error fetching participants:', err);
    next(err);
  }
});

/**
 * @swagger
 * /api/participants:
 *   post:
 *     summary: Create a new participant
 *     tags: [Participants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               skill_level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced, expert]
 */
router.post('/', async (req, res, next) => {
  try {
    const validatedData = participantSchema.parse(req.body);

    const [participant] = await db('participants')
      .insert(validatedData)
      .returning('*');

    logger.info(`Participant created: ${participant.name}`);
    res.status(201).json(participant);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: err.errors,
      });
    }
    logger.error('Error creating participant:', err);
    return next(err);
  }
});

/**
 * @swagger
 * /api/participants/{id}:
 *   get:
 *     summary: Get participant by ID
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const participant = await db('participants').where({ id }).first();

    if (!participant) {
      return res.status(404).json({
        status: 'error',
        message: 'Participant not found',
      });
    }

    res.json(participant);
  } catch (err) {
    logger.error('Error fetching participant:', err);
    return next(err);
  }
});

/**
 * @swagger
 * /api/participants/{id}/bookings:
 *   get:
 *     summary: Get participant's bookings
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id/bookings', async (req, res, next) => {
  try {
    const { id } = req.params;

    const bookings = await db('bookings')
      .join('appointments', 'bookings.appointment_id', 'appointments.id')
      .join('arenas', 'appointments.arena_id', 'arenas.id')
      .where('bookings.participant_id', id)
      .select(
        'bookings.*',
        'appointments.title as appointment_title',
        'appointments.start_time',
        'appointments.end_time',
        'arenas.name as arena_name'
      )
      .orderBy('appointments.start_time');

    res.json(bookings);
  } catch (err) {
    logger.error('Error fetching participant bookings:', err);
    next(err);
  }
});

/**
 * @swagger
 * /api/participants/{id}/book:
 *   post:
 *     summary: Book participant for an appointment
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointment_id
 *             properties:
 *               appointment_id:
 *                 type: integer
 */
router.post('/:id/book', async (req, res, next) => {
  try {
    const participantId = parseInt(req.params.id);
    const { appointment_id } = bookingSchema.parse({
      participant_id: participantId,
      appointment_id: req.body.appointment_id,
    });

    const [booking] = await db('bookings')
      .insert({
        participant_id: participantId,
        appointment_id,
        status: 'booked',
      })
      .returning('*');

    logger.info(
      `Booking created: Participant ${participantId} -> Appointment ${appointment_id}`
    );
    res.status(201).json(booking);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: err.errors,
      });
    }
    logger.error('Error creating booking:', err);
    return next(err);
  }
});

export default router;
